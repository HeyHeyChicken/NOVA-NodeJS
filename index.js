const LIBRARIES = {
    FS: require("fs"),
    Colors: require("colors"),
    ChildProcess: require("child_process"),
    ReadLine: require("readline"),
    SocketIO: require("socket.io"),
};

class Launcher {
    constructor() {
        const SELF = this;

        SELF.GitClientURL = "https://github.com/HeyHeyChicken/NOVA-Client.git";
        SELF.GitServerURL = "https://github.com/HeyHeyChicken/NOVA-Server.git";

        SELF.ClientPath = __dirname + "/src/client";
        SELF.ServerPath = __dirname + "/src/server";

        SELF.Settings = JSON.parse(LIBRARIES.FS.readFileSync(__dirname + "/settings.json", "utf8"));
        SELF.SocketServer = null;

        console.log("######################################");
        console.log("##                                  ##");
        console.log("##   Welcome to NOVA's launcher !   ##");
        console.log("##                                  ##");
        console.log("######################################");

        SELF.CheckLicense();
        SELF.InitialiseSocketServer();

        SELF.CheckLaunchClientOnStartSettings(function(){
            SELF.CheckLaunchServerOnStartSettings(function(){
                SELF.Launch(SELF.Settings.LaunchServerOnStart, SELF.ServerPath, SELF.GitServerURL, "NOVA - Server", function(){
                    SELF.InstallPackages(SELF.ServerPath, "NOVA - Server", function () {
                        SELF.Launch(SELF.Settings.LaunchClientOnStart, SELF.ClientPath, SELF.GitClientURL, "NOVA - Client", function(){
                            SELF.InstallPackages(SELF.ClientPath, "NOVA - Client", function () {
                                SELF.Terminal("node index.js", SELF.ServerPath);
                                SELF.Terminal("node index.js", SELF.ClientPath);
                            });
                        });
                    });
                });
            });
        });
    }

    // Cette fonction initialise le serveur socket reliant le launcher au serveur NOVA.
    InitialiseSocketServer(){
        const SELF = this;

        this.SocketServer = LIBRARIES.SocketIO();
        this.SocketServer.on("connection", function(socket){ // Un serveur vient de se connecter au launcher.
            // Si le serveur demande au launcher d'afficher du texte dans la console.
            socket.on("log", function(_text, _color, _header){
                SELF.Log(_text, _color, _header)
            });

            // Si le serveur demande au launcher de le redémarrer.
            socket.on("reboot", function(){
                SELF.Log("Rebooting ...", "green");
                socket.emit("reboot");

                setTimeout(function(){
                    SELF.Terminal("node index.js", SELF.ServerPath);
                    SELF.Terminal("node index.js", SELF.ClientPath);
                }, 1000);
            });
        });

        this.SocketServer.listen(8082);
    }

    // Cette fonction instale les packages nécessaires à l'execution d'une application.
    InstallPackages(_path, _name, _callback){
        const SELF = this;

        SELF.Terminal("npm install", _path, function(_error_code, _messages){
            if(_error_code === 0){
                SELF.Log("Your \"" + _name + "\" app's packages are installed.", "green");

                if(_callback !== undefined){
                    _callback();
                }
            }
            else{
                console.log(_error_code);
            }
        });
    }

    // Cette fonction lance une instance de NOVA.
    Launch(_settings, _path, _git, _name, _callback){
        const SELF = this;

        if(_settings = 1){
            if (!LIBRARIES.FS.existsSync(_path)) {
                SELF.Log("It seems that you don't have \"" + _name + "\" installed, we are downloading it.", "green");
                SELF.Terminal("git --version", null, function(_error_code, _messages){
                    if(_error_code === 0){
                        SELF.Terminal("git clone " + _git + " " + _path, null, function(_error_code, _messages){
                            if(_error_code === 0){
                                SELF.Log("The download went well.", "green");
                                if(_callback !== undefined){
                                    _callback();
                                }
                            }
                        });
                    }
                });
            }
            else{
                SELF.CheckUpdate(_path, function(_updateAvailable){
                    if(_updateAvailable === true){
                        SELF.Log("Your \"" + _name + "\" app seems to be up to date.", "green");
                        if(_callback !== undefined){
                            _callback();
                        }
                    }
                    else{
                        SELF.Log("A new version of \"" + _name + "\" is available.", "red");
                        if(SELF.Settings.UpdateAtBoot === true){
                            SELF.Log("Because \"UpdateAtBoot\" is set to \"true\", we are starting the update.", "green");
                            SELF.Update(_path, function(){
                                if(_callback !== undefined){
                                    _callback();
                                }
                            });
                        }
                        else{
                            if(_callback !== undefined){
                                _callback();
                            }
                        }
                    }
                });
            }
        }
    }

    // Cette fonction vérifie auprès de l'utilisateur s'il faut ou non démarrer un client au démarrage du launcher.
    CheckLaunchClientOnStartSettings(_callback){
        const SELF = this;

        if(SELF.Settings.LaunchClientOnStart === null){
            SELF.AskQuestion("Do you want the launcher to auto start a client ? (Y/n)", function(_answer){
                if(_answer.toLowerCase() === "y" || _answer.toLowerCase() === "yes"){
                    SELF.Settings.LaunchClientOnStart = true;
                }
                else{
                    SELF.Settings.LaunchClientOnStart = false;
                }
                LIBRARIES.FS.writeFileSync(__dirname + "/settings.json", JSON.stringify(SELF.Settings, null, 4), "utf8");
                _callback();
            });
        }
        else{
            _callback();
        }
    }

    // Cette fonction vérifie auprès de l'utilisateur s'il faut ou non démarrer un serveur au démarrage du launcher.
    CheckLaunchServerOnStartSettings(_callback){
        const SELF = this;

        if(SELF.Settings.LaunchServerOnStart === null){
            SELF.AskQuestion("Do you want the launcher to auto start a server ? (Y/n)", function(_answer){
                if(_answer.toLowerCase() === "y" || _answer.toLowerCase() === "yes"){
                    SELF.Settings.LaunchServerOnStart = true;
                }
                else{
                    SELF.Settings.LaunchServerOnStart = false;
                }
                LIBRARIES.FS.writeFileSync(__dirname + "/settings.json", JSON.stringify(SELF.Settings, null, 4), "utf8");
                _callback();
            });
        }
        else{
            _callback();
        }
    }

    // Cette fonction met à jour NOVA.
    Update(_path, _callback){
        const SELF = this;

        SELF.Log("Updating...", "green");
        SELF.Terminal("git pull", _path, function(_error_code, _messages){
            if(_error_code === 0){
                SELF.Log("The update went well.", "green");

                if(_callback !== undefined){
                    _callback();
                }
            }
            else{
                console.log(_error_code);
            }
        });
    }

    // Cette fonction regarde s'il existe des mises à jour.
    CheckUpdate(_path, _callback){
        const SELF = this;

        SELF.Terminal("git fetch origin", _path, function(_error_code, _messages){
            if(_error_code === 0){
                SELF.Terminal("git status", _path, function(_error_code, _messages){
                    if(_error_code === 0){
                        if(_messages.includes("Your branch is up to date with 'origin/master'.")){
                            if(_callback !== undefined){
                                _callback(true);
                            }
                        }
                        else {
                            _callback(false);
                        }
                    }
                });
            }
        });
    }

    // Cette fonction exécute des commandes terminales sur le poste du client.
    Terminal(_command, _path, _callback){
        const SELF = this;

        const MESSAGES = [];
        const EXECUTION = LIBRARIES.ChildProcess.exec(_command, { cwd: _path });

        EXECUTION.stdout.on("data", (_data) => {
            _data = _data.split("\n");
            for(let i = 0; i < _data.length; i++){
                if(_data[i].length > 0){
                    MESSAGES.push(_data[i]);
                    if(SELF.Settings.Debug === true){
                        SELF.Log(_data[i]);
                    }
                }
            }
        });

        EXECUTION.stderr.on("data", (_data) => {
            _data = _data.split("\n");
            for(let i = 0; i < _data.length; i++){
                if(_data[i].length > 0){
                    MESSAGES.push(_data[i]);
                    if(SELF.Settings.Debug === true){
                        SELF.Log(_data[i]);
                    }
                }
            }
        });

        EXECUTION.on("close", (_error_code) => {
            if(_callback !== undefined){
                _callback(_error_code, MESSAGES);
            }
        });
    }

    // Cette fonction pose une question à l'utilisateur via l'invite de commandes.
    AskQuestion(_question, _callback) {
        this.Log(_question, "green");
        const RL = LIBRARIES.ReadLine.createInterface({
            input: process.stdin
        });

        return new Promise(resolve => RL.question(_question, function(_answer) {
            RL.close();
            if(_callback !== undefined){
                _callback(_answer);
            }
        }));
    }

    // Cette fonction vérifie la license.
    CheckLicense() {
        if(this.Settings.LicenseKey !== "non-commercial-and-evaluation"){
            this.Log("Your license key is invalid.", "red");
            process.exit();
        }
    }

    // Cette fonction remplace la fonction "console.log".
    Log(_text, _color = "white", _header = "NOVA LAUNCHER"){
        if(_text.length > 0){
            if(LIBRARIES.Colors[_color] !== undefined){
                console.log("[" + (LIBRARIES.Colors[_color](_header)) + "] " + _text);
            }
            else{
                console.log(LIBRARIES.Colors.red("The color \"" + _color + "\" does not exist in the \"colors\" package."));
            }
        }
    }
}

const LAUNCHER = new Launcher();