import ipc from "@achrinza/node-ipc";

ipc.config.id = "a-unique-process-name1";
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.serve(() =>
    ipc.server.on("a-unique-message-name", (message) => {
        console.log(message);
    })
);
ipc.server.start();
console.log("IPC server started!");
