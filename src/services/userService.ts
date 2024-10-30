import User, {UserType} from "../models/User";


export async function getUserById(id: number) {
  const user = await User.query().findById(id);
  return (user) || null;
}

// Function to add a new user
export async function addUser(data:Omit<UserType,'id'>) {
  const newData:{[key:string]:any}={...data};
  delete newData["confirm_password"];
  const newUser = await User.query().insert(newData);
  return newUser;
}

// Function to update an existing user
export async function updateUser(id:number,data:Omit<UserType,'id'>) {
  const newData:{[key:string]:any}={...data};
  delete newData["confirm_password"];
  const updatedUser = await User.query().patchAndFetchById(id, newData);
  return updatedUser || null;
}

// Function to delete a user
export async function deleteUser(id: number) {
  // Hapus user berdasarkan ID
  const numDeleted = await User.query().deleteById(id);
  return numDeleted > 0; // Return true jika ada yang dihapus
}
