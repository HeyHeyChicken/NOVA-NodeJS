const fileSystem = require("fs");
const colors = require("colors");
const childProcess = require("child_process");
const readline = require("readline");
const socketIO = require("socket.io");
const path = require("path");

const LIBRARIES = {
    FS: fileSystem,
    Colors: colors,
    ChildProcess: childProcess,
    ReadLine: readline,
    SocketIO: socketIO,
    Path: path
};

class Launcher {
    demoMode = false;

    constructor() {
        const SELF = this;

        if (process.argv[2] !== undefined) {
            if (process.argv[2] === "demo") {
                SELF.demoMode = true;
            }
        }

        SELF.gitClientURL = "https://github.com/HeyHeyChicken/NOVA-Client.git";
        SELF.gitServerURL = "https://github.com/HeyHeyChicken/NOVA-Server.git";

        SELF.clientPath = LIBRARIES.Path.join(__dirname, "/src/client");
        SELF.serverPath = LIBRARIES.Path.join(__dirname, "/src/server");

        SELF.settings = JSON.parse(LIBRARIES.FS.readFileSync(__dirname + "/settings.json", "utf8"));
        SELF.socketServer = null;

        if (SELF.demoMode) {
            SELF.settings.LaunchClientOnStart = true;
            SELF.settings.LaunchServerOnStart = true;
            SELF.settings.Debug = false;
        }

        console.log("######################################");
        console.log("##                                  ##");
        console.log("##   Bienvenido al lanzador de NOVA  ##");
        console.log("##                                  ##");
        console.log("######################################");

        SELF.checkLicense();
        SELF.initialiseSocketServer();

        SELF.checkLaunchClientOnStartSettings(function () {
            SELF.checkLaunchServerOnStartSettings(function () {
                SELF.launch(SELF.settings.LaunchServerOnStart, SELF.serverPath, SELF.gitServerURL, "NOVA - Server", function () {
                    SELF.installPackages(SELF.settings.LaunchServerOnStart, SELF.serverPath, "NOVA - Server", function () {
                        SELF.launch(SELF.settings.LaunchClientOnStart, SELF.clientPath, SELF.gitClientURL, "NOVA - Client", function () {
                            SELF.installPackages(SELF.settings.LaunchClientOnStart, SELF.clientPath, "NOVA - Client", function () {
                                if (SELF.settings.LaunchServerOnStart === true) {
                                    SELF.log("Iniciando el servidor...", "green");
                                    SELF.terminal("node index.js", SELF.serverPath);
                                }
                                if (SELF.settings.LaunchClientOnStart === true) {
                                    SELF.log("Iniciando el cliente...", "green");
                                    SELF.terminal("node index.js", SELF.clientPath);
                                }
                            });
                        });
                    });
                });
            });
        });
    }

    initialiseSocketServer() {
        const SELF = this;

        this.socketServer = LIBRARIES.SocketIO();
        this.socketServer.on("connection", function (socket) {
            socket.on("log", function (_text, _color, _header) {
                SELF.log(_text, _color, _header);
            });

            socket.on("reboot_server", function () {
                SELF.log("Reiniciando el servidor...", "green");
                socket.emit("reboot");

                setTimeout(function () {
                    if (SELF.settings.LaunchServerOnStart === true) {
                        SELF.terminal("node index.js", SELF.serverPath);
                    }
                }, 1000);
            });

            socket.on("reboot_client", function () {
                SELF.log("Reiniciando el cliente...", "green");
                socket.emit("reboot");

                setTimeout(function () {
                    if (SELF.settings.LaunchClientOnStart === true) {
                        SELF.terminal("node index.js", SELF.clientPath);
                    }
                }, 1000);
            });
        });

        this.socketServer.listen(8082);
    }

    installPackages(_settings, _path, _name, _callback) {
        const SELF = this;

        if (_settings === true) {
            SELF.terminal("npm install", _path, function (_errorCode, _messages) {
                if (_errorCode === 0) {
                    SELF.log(`Las dependencias de tu aplicación "${_name}" se han instalado.`, "green");

                    if (_callback !== undefined) {
                        _callback();
                    }
                } else {
                    console.log("Error en la instalación de npm: " + _errorCode);
                }
            });
        } else {
            if (_callback !== undefined) {
                _callback();
            }
        }
    }

    // Resto del código...

    log(_text, _color = "white", _header = "NOVA LAUNCHER") {
        if (_text.length > 0) {
            if (LIBRARIES.Colors[_color] !== undefined) {
                console.log("[" + (LIBRARIES.Colors[_color](_header)) + "] " + _text);
            } else {
                console.log(LIBRARIES.Colors.red(`El color "${_color}" no existe en el paquete "colors".`));
            }
        }
    }
}

const LAUNCHER = new Launcher();
                                    
