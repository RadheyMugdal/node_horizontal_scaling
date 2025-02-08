import express from "express";
import cluster from "cluster";
import os from "os";

const totalCpus = os.cpus().length;
const port = 3000;
if (cluster.isPrimary) {
  console.log("Total number of cps is:", totalCpus);
  console.log(`Primary process ${process.pid} is running`);

  //fork workers
  for (let i = 0; i < totalCpus; i++) {
    cluster.fork();
  }
  // if worker dies fork new worker
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Forking new worker");
    cluster.fork();
  });
} else {
  const app = express();
  console.log(`Worker ${process.pid} is started`);

  app.get("/", (req, res) => {
    res.send("Hello World");
  });

  app.get("/api/:n", (req, res) => {
    let n = parseInt(req.params.n);
    let count = 0;
    if (n > 50000000) n = 50000000;
    for (let i = 0; i < n; i++) {
      count += i;
    }
    res.send(`Final count is ${count} with worker ${process.pid}`);
  });
  app.listen(port, () => {
    console.log(`Worker ${process.pid} is running on port ${port}`);
  });
}
