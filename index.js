const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wohac.mongodb.net/cluster0?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect((err) => {
      const dataCollection = client.db("practice").collection("datasets");

      // sending data to mongodb
      // -------------------------POST Method
      app.post("/adduser", async (req, res) => {
        const user = req.body;
        // console.log("post api was hit", user); //will show in cmd
        const result = await dataCollection.insertOne(user);
        console.log(result);
        res.json(result); //res.send is for mongodb. it will show in client-side's console.log()
      });

      // -------------------------GET Method
      app.get("/users", async (req, res) => {
        const cursor = dataCollection.find({});
        const users = await cursor.toArray();
        res.send(users);
        // localhost:5000/users will show all the data
      });

      // -------------------------GET Method
      // see specific data in server-page
      app.get("/details/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const details = await dataCollection.findOne(query);
        res.json(details);
      });

      // -------------------------UPDATE Method
      app.put("/details/:id", async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            name: updatedUser.name,
            email: updatedUser.email,
            age: updatedUser.age,
          },
        };
        const result = await dataCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });

      // -------------------------DELETE Method
      app.delete("/users/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await dataCollection.deleteOne(query);
        res.send(result);
      });
      // client.close();
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// ---------------------------heroku server check
app.get("/hello", (req, res) => {
  res.send("hello world!");
});

app.get("/", (req, res) => {
  res.send("server side is running ");
});

app.listen(port, () => {
  console.log("server has started on port", port);
});
