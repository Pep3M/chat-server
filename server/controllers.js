import { createUser, listUsers } from "./db/helper.js";

// handlers
const handleError = (res, error) => {
  console.log(error);
  res.status(500).send('Internal server error');
};

// controllers
export const userListController = async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users.rows);
  } catch (error) {
    handleError(res, error);
  }
}

export const userCreateController = async (req, res) => {
  try {
    console.log(req);
    const { name } = req.body;
    await createUser(name);
    res.status(201).send('User created');
  } catch (error) {
    handleError(res, error);
  }
}