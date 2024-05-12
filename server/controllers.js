import { createUser, getUser, listUsers } from "./db/helper.js";

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
    const { lastInsertRowid } = await createUser(name);
    const resp = await getUser(lastInsertRowid);
    if (!resp.rows.length) {
      throw new Error('User not found');
    }
    res.json(resp.rows[0]).status(201);
  } catch (error) {
    handleError(res, error);
  }
}