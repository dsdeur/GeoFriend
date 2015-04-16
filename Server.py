import sys
import json

from twisted.python import log
from twisted.internet import reactor

from autobahn.twisted.websocket import WebSocketServerProtocol, \
    WebSocketServerFactory

from autobahn.twisted.resource import WebSocketResource


directions = {}

class BroadcastServerFactory(WebSocketServerFactory):
    """
    Simple broadcast server broadcasting any message it receives to all
    currently connected clients.
    """

    def __init__(self):
        WebSocketServerFactory.__init__(self)
        self.clients = []


    def register(self, client):
        if client not in self.clients:
            print("registered client {}".format(client.peer))

            self.clients.append(client)


    def unregister(self, client):
        if client in self.clients:
            print("unregistered client {}".format(client.peer))
            self.clients.remove(client)


    def broadcast(self, data):
        for c in self.clients:
            c.sendMessage(data.encode('utf8'))


class STRPServerProtocol(WebSocketServerProtocol):
    """ Server protocol for the sockets
        All socket communication will go through this
    """

    def onConnect(self, request):
        print("New connection: {0}".format(request.peer))


    def onOpen(self):
        self.factory.register(self)


    def connectionLost(self, reason):
        WebSocketServerProtocol.connectionLost(self, reason)
        self.factory.unregister(self)


    def onMessage(self, payload, isBinary):
        """ Handles all incoming messages
        """
        if isBinary:
            print("Binary message: {0} bytes".format(len(payload)))
        else:
            self.decodePayload(payload)


    def decodePayload(self, payload):
        """ Decode payload implements a socket.io like protocol
            This will call the handler function based on the message
        """

        decodedPayload = json.loads(payload.decode('utf8'))
        message = "on_{0}".format(decodedPayload['message'])

        # Get the method by string, based on the message
        method = getattr(self, message)

        try:
            # Run the handler with the data
            method(decodedPayload['data'])
        except NameError:
            pass


    def broadcast(self, message, data):
        """ Broadcasts message to all sockets
            Uses socket.io like protocol with message
        """
        # Create the dict for the data
        sendableObject = {
            'message': message,
            'data': data
        }

        # Stringify the dict and send it
        jsonString = json.dumps(sendableObject)
        self.factory.broadcast(jsonString)


    def on_new_distance_input(self, data):
        print("New input: {0}".format(data))
        # magic
        self.broadcast('new_distance', data)


    def on_new_orientation_input(self, data):
        self.broadcast('new_orientation', data);


    def on_connect(self, data):
        self.broadcast('connect', data);


    def on_reset(self, data):
        self.broadcast('reset', data);


    def on_placed_treasure(self, data):
        directions["device{0}".format(data["deviceNr"])] = data["orientation"]

        self.broadcast('controller_treasure_placed', data);

        print("placed_treasure: {0}".format(directions))

        if len(directions) == 3:
            for i in range(0,3):
                x = i + 1

                if x == 3:
                    x = 0

                data = {
                    "deviceNr": x,
                    "orientation": directions["device{0}".format(i)]
                }

                print(data)
                self.broadcast('treasure_position', data)

    def on_reset_treasure(self, data):
        directions = {}
        print("Reset treasures: {0}".format(directions))

if __name__ == '__main__':
    ServerFactory = BroadcastServerFactory

    log.startLogging(sys.stdout)

    factory = ServerFactory()
    factory.protocol = STRPServerProtocol

    reactor.listenTCP(18443, factory)
    reactor.run()
