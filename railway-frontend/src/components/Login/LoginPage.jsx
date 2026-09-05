import LoginForm from "./LoginForm";
import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page-2col">
      <div className="login-emoji-col">
        <span className="login-train-emoji" role="img" aria-label="train">🚆</span>
      </div>
      <div className="login-form-col">
        <div className="login-form-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
