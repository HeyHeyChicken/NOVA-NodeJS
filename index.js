const LIBRARIES = {
    FS: require("fs"),
    Colors: require("colors"),
    ChildProcess: require("child_process"),
    ReadLine: require("readline")
};

class Launcher {
    constructor() {
        const SELF = this;

        SELF.UpdateAtBoot = true; // If true, the launcher will auto update NOVa at boot.

        SELF.GitClientURL = "https://github.com/HeyHeyChicken/NOVA-Client.git";
        SELF.GitServerURL = "https://github.com/HeyHeyChicken/NOVA-Server.git";

        SELF.ClientInstance = null;
        SELF.ServerInstance = null;

        SELF.ClientPath = __dirname + "/src/client";
        SELF.ServerPath = __dirname + "/src/server";

        SELF.Settings = JSON.parse(LIBRARIES.FS.readFileSync(__dirname + "/settings.json", "utf8"));

        console.log("######################################");
        console.log("##                                  ##");
        console.log("##   Welcome to NOVA's launcher !   ##");
        console.log("##                                  ##");
        console.log("######################################");

        SELF.CheckLicense();

        SELF.CheckLaunchClientOnStartSettings(function(){
            SELF.CheckLaunchServerOnStartSettings(function(){
                SELF.Launch(SELF.Settings.LaunchServerOnStart, SELF.ServerPath, SELF.GitServerURL, "NOVA - Server", function(){
                    SELF.InstallPackages(SELF.ServerPath, "NOVA - Server", function () {
                        SELF.Launch(SELF.Settings.LaunchClientOnStart, SELF.ClientPath, SELF.GitClientURL, "NOVA - Client", function(){
                            SELF.InstallPackages(SELF.ClientPath, "NOVA - Client", function () {
                                if(SELF.Settings.LaunchServerOnStart === true){
                                    const REQUIRE = require(SELF.ServerPath + "/src/lib/Main.js");
                                    SELF.ServerInstance = new REQUIRE(SELF.ServerPath + "/src", SELF);
                                }

                                if(SELF.Settings.LaunchClientOnStart === true){
                                    const REQUIRE = require(SELF.ClientPath + "/src/lib/Main.js");
                                    SELF.ClientInstance = new REQUIRE(SELF.ClientPath + "/src", SELF);
                                }
                            });
                        });
                    });
                });
            });
        });
    }

    // Cette fonction instale les packages nécessaires à l'execution d'une application.
    InstallPackages(_path, _name, _callback){
        const SELF = this;

        SELF.Terminal("cd " + _path + "; npm install", function(_error_code, _messages){
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
                SELF.Terminal("git --version", function(_error_code, _messages){
                    if(_error_code === 0){
                        SELF.Terminal("git clone " + _git + " " + _path, function(_error_code, _messages){
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
                        if(SELF.UpdateAtBoot === true){
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
            SELF.AskQuestion("Do you want the launcher to auto start a client ? (y/n)", function(_answer){
                if(_answer === "y"){
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
            SELF.AskQuestion("Do you want the launcher to auto start a server ? (y/n)", function(_answer){
                if(_answer === "y"){
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
        SELF.Terminal("cd " + _path + "; git pull", function(_error_code, _messages){
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

        SELF.Terminal("cd " + _path + "; git fetch origin", function(_error_code, _messages){
            if(_error_code === 0){
                SELF.Terminal("cd " + _path + "; git status", function(_error_code, _messages){
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
    Terminal(_command, _callback){
        const SELF = this;

        const MESSAGES = [];
        const EXECUTION = LIBRARIES.ChildProcess.exec(_command);

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