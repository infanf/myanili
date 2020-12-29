interface UserResponseSuccess {
  id: number;
  name: string;
  location: string;
  joined_at: string;
  picture: string;
}

interface UserResponseFail {
  auth: false;
}

export type UserResponse = UserResponseSuccess | UserResponseFail;
