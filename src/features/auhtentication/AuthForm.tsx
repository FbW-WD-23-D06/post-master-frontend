import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
} from "@ionic/react";
import { FormEvent, useState } from "react";
import useToastManager, { ToastInfo } from "../../hooks/useToastManager";
import { validations } from "./validations";
import { endpoints } from "../../data/api";
import { useAppContext } from "../../contexts/AppContext";
import { set } from "date-fns";

interface AuthFormProps {
  authType: "register" | "login";
}

export default function AuthForm({ authType }: AuthFormProps) {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    userName: "",
    password: "",
  });

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastInfo, setToastInfo] = useState<ToastInfo>({
    message: "",
    color: "",
  });

  const { dispatchUser } = useAppContext();

  useToastManager({ toastInfo, setToastInfo, setIsToastVisible });

  const successSendAction = () => {
    setUsername("");
    setPassword("");
    setErrorMessage({
      userName: "",
      password: "",
    });
  };

  const isUserNameValid = validations.userName(userName) === "valid";
  const isPasswordValid = validations.password(password) === "valid";

  const isRegister = authType === "register";
  const isLogin = authType === "login";

  const buttonText = isRegister ? "Register" : "Login";

  const authUser = async () => {
    const user = {
      userName,
      password,
    };

    const failedMessages = {
      login: "Login failed.",
      register: "Registration failed.",
    };

    try {
      const response = await fetch(
        isRegister ? endpoints.register : endpoints.login,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token") || "",
          },
          body: JSON.stringify(user),
        }
      );

      const data = await response.json();
      console.log("🚀 ~ authUser ~ data:", data)
      if (!response.ok) {
        throw new Error(
          data.error?.message || data?.message || failedMessages[authType]
        );
      }
      if (isLogin) {
        localStorage.setItem("token", data.token);
        dispatchUser({ type: "login", field: "userName", value: userName });
      }
      successSendAction();
      return data;
    } catch (error) {
      console.error("🚀 ~ authentication ~ error:", error);
      throw error;
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authUser();
      setToastInfo({
        message: `${isRegister ? "Registration" : "Login"} successful!`,
        color: "success",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Register user error:", err);
      setToastInfo({
        message: err.message,
        color: "danger",
        duration: 3000,
        buttons: "dismiss",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserNameChange = (e: CustomEvent) => {
    const newUserName = e.detail.value;
    setUsername(newUserName);
    const userNameValidation = validations.userName(newUserName);
    setErrorMessage((prev) => ({
      ...prev,
      userName: userNameValidation,
    }));
  };

  const handlePasswordChange = (e: CustomEvent) => {
    const newPassword = e.detail.value;
    setPassword(newPassword);
    const passwordValidation = validations.password(newPassword);
    setErrorMessage((prev) => ({
      ...prev,
      password: passwordValidation,
    }));
  };

  return (
    <form onSubmit={handleRegister}>
      <IonItem>
        <IonLabel position="floating">User Name</IonLabel>
        <IonInput
          aria-label="User Name"
          value={userName}
          onIonInput={handleUserNameChange}
          clearInput
          minlength={2}
          counter
        />
        {errorMessage.userName !== "" && !isUserNameValid && (
          <IonNote color="danger">{errorMessage.userName}</IonNote>
        )}
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Password</IonLabel>
        <IonInput
          aria-label="Password"
          type="password"
          value={password}
          onIonInput={handlePasswordChange}
          clearInput
          minlength={8}
        />
        {errorMessage.password !== "" && !isPasswordValid && (
          <IonNote color="danger">{errorMessage.password}</IonNote>
        )}
      </IonItem>
      <IonButton
        disabled={
          isToastVisible || loading || !isUserNameValid || !isPasswordValid
        }
        type="submit"
        expand="block"
        style={{ marginTop: 20 }}
      >
        {loading ? <IonSpinner /> : buttonText}
      </IonButton>
    </form>
  );
}
