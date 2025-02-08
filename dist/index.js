"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const totalCpus = os_1.default.cpus().length;
const port = 3000;
if (cluster_1.default.isPrimary) {
    console.log("Total number of cps is:", totalCpus);
    console.log(`Primary process ${process.pid} is running`);
    //fork workers
    for (let i = 0; i < totalCpus; i++) {
        cluster_1.default.fork();
    }
    // if worker dies fork new worker
    cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Forking new worker");
        cluster_1.default.fork();
    });
}
else {
    const app = (0, express_1.default)();
    console.log(`Worker ${process.pid} is started`);
    app.get("/", (req, res) => {
        res.send("Hello World");
    });
    app.get("/api/:n", (req, res) => {
        let n = parseInt(req.params.n);
        let count = 0;
        if (n > 50000000)
            n = 50000000;
        for (let i = 0; i < n; i++) {
            count += i;
        }
        res.send(`Final count is ${count} with worker ${process.pid}`);
    });
    app.listen(port, () => {
        console.log(`Worker ${process.pid} is running on port ${port}`);
    });
}
