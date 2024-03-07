// pages/Login.tsx
import { useState, FormEvent } from "react";
import { useUserContext } from "../contexts/UserContext";

import { IonPage, IonContent } from "@ionic/react";
import Header from "../features/navigation/layout/Header";
import { endpoints } from "../data/api";

interface LoginProps {}

export default function Login({}: LoginProps) {
  const { userState, dispatch } = useUserContext();
  const { isLoggedIn } = userState;

  const [userName, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("login");

    try {
      const response = await fetch(endpoints.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //schema: userName
        body: JSON.stringify({ userName, password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("yay!");
        console.log(data);
        const loggedInUserName = data.user.userName;
        // TODO: save data in context
        dispatch({ type: "login", userName: loggedInUserName, isLoggedIn: true });
        console.log(userState);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <IonPage>
      <Header title="Login" />
      <IonContent fullscreen>
        {isLoggedIn ? <h1>👉Post Master beste App!😸</h1> : (
          <>
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
              <input
                type="text"
                placeholder="name"
                value={userName ?? ""}
                id="userName"
                onChange={(e) => setUsername(e.target.value)}
              />
              <br />
              <input
                type="password"
                placeholder="password"
                value={password ?? ""}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <br />
              <button>Login</button>
            </form>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}