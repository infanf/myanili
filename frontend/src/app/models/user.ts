interface UserResponseSuccess extends UserInterface {
  location: string;
  joined_at: string;
}

interface UserResponseFail {
  auth: false;
}

interface UserInterface {
  name: string;
  picture: string;
  id: number;
}

export type UserResponse = UserResponseSuccess | UserResponseFail;
export type MalUser = UserInterface;
