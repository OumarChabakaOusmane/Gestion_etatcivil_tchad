export default function Login() {
  return (
    <div className="container mt-5">
      {/* Titre */}
      <h2 className="text-center mb-4">Connexion</h2>

      {/* Formulaire */}
      <form className="col-md-6 mx-auto">
        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Entrer votre email"
          />
        </div>

        {/* Mot de passe */}
        <div className="mb-3">
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            className="form-control"
            placeholder="Entrer votre mot de passe"
          />
        </div>

        {/* Bouton */}
        <button type="submit" className="btn btn-primary w-100">
          Se connecter
        </button>
      </form>
    </div>
  );
}
