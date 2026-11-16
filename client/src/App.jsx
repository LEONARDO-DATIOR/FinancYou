import { useCallback, useEffect, useState } from "react";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
});

function getToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00.000Z`));
}

export default function App() {
  const [rendas, setRendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    TipoDeRenda: "Salário",
    Nome: "",
    Data: getToday(),
    Valor: "",
  });

  const loadRendas = useCallback(async () => {
    setError("");

    try {
      const response = await fetch("/api/rendas");
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Não foi possível carregar as rendas.");
      }
      setRendas(result);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRendas();
  }, [loadRendas]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/rendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, Valor: Number(form.Valor) }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Não foi possível cadastrar a renda.");
      }

      setRendas((current) =>
        [result, ...current].sort(
          (first, second) =>
            second.Data.localeCompare(first.Data) || second.ID - first.ID,
        ),
      );
      setForm((current) => ({ ...current, Nome: "", Valor: "" }));
      setSuccess("Renda cadastrada com sucesso.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <header className="header">
        <a className="brand" href="/" aria-label="FinancYou - início">
          <span className="brand-mark" aria-hidden="true">$</span>
          <span>Financ<span className="brand-accent">You</span></span>
        </a>
        <span className="header-note">Seu controle financeiro, mais simples.</span>
      </header>

      <section className="intro">
        <p className="eyebrow">CONTROLE FINANCEIRO</p>
        <h1>Suas rendas</h1>
        <p>Acompanhe suas entradas e mantenha tudo organizado.</p>
      </section>

      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="notice success" role="status">
          {success}
        </div>
      )}

      <div className="content-grid">
        <section className="panel list-panel" aria-labelledby="list-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">VISÃO GERAL</p>
              <h2 id="list-title">Entradas cadastradas</h2>
            </div>
            <span className="count">{rendas.length}</span>
          </div>

          {loading ? (
            <p className="empty-state">Carregando rendas...</p>
          ) : rendas.length === 0 ? (
            <p className="empty-state">
              Nenhuma renda por aqui. Cadastre sua primeira entrada ao lado.
            </p>
          ) : (
            <ul className="income-list">
              {rendas.map((renda) => (
                <li className="income-item" key={renda.ID}>
                  <span className="income-icon" aria-hidden="true">↗</span>
                  <div className="income-details">
                    <strong>{renda.Nome}</strong>
                    <span>
                      {renda.TipoDeRenda} <span aria-hidden="true">·</span>{" "}
                      {formatDate(renda.Data)}
                    </span>
                  </div>
                  <strong className="income-value">
                    {currency.format(Number(renda.Valor))}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel form-panel" aria-labelledby="form-title">
          <p className="eyebrow">NOVA ENTRADA</p>
          <h2 id="form-title">Cadastrar renda</h2>
          <form onSubmit={submitForm}>
            <label>
              Tipo de renda
              <select
                name="TipoDeRenda"
                value={form.TipoDeRenda}
                onChange={updateForm}
              >
                <option>Salário</option>
                <option>Freelance</option>
                <option>Investimentos</option>
                <option>Outros</option>
              </select>
            </label>
            <label>
              Nome
              <input
                name="Nome"
                value={form.Nome}
                onChange={updateForm}
                placeholder="Ex.: Salário mensal"
                maxLength={120}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Data
                <input
                  type="date"
                  name="Data"
                  value={form.Data}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                Valor (R$)
                <input
                  type="number"
                  name="Valor"
                  value={form.Valor}
                  onChange={updateForm}
                  placeholder="0,00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
            </div>
            <button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Cadastrar renda"}
            </button>
          </form>
        </section>
      </div>
      <footer>FinancYou <span aria-hidden="true">·</span> Organização que faz bem.</footer>
    </main>
  );
}
