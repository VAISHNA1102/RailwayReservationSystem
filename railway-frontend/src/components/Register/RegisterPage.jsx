import RegisterForm from "./RegisterForm";
import "./RegisterPage.css";

function RegisterPage() {
  return (
    <div className="register-page-2col">
      <div className="register-emoji-col">
        <span className="register-train-emoji" role="img" aria-label="train">🚆</span>
        <span className="register-emoji-tagline">Create your journey</span>
      </div>
      <div className="register-form-col">
        <div className="register-form-center">
          <h3 className="register-heading">Register <span role="img" aria-label="train">🚉</span></h3>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
