export default function Register() {
  return (
    <div className="container mt-5">
      {/* Titre */}
      <h2 className="text-center mb-4">Inscription</h2>

      {/* Formulaire */}
      <form className="col-md-6 mx-auto">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Nom"
        />

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Prénom"
        />

        <input
          type="email"
          className="form-control mb-2"
          placeholder="Email"
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Mot de passe"
        />

        <button type="submit" className="btn btn-success w-100">
          S'inscrire
        </button>
      </form>
    </div>
  );
}
