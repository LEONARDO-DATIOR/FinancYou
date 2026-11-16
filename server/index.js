require("dotenv").config();

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = Number(process.env.PORT) || 3001;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json({ limit: "10kb" }));

app.get("/api/rendas", async (_request, response) => {
  const { data, error } = await supabase
    .from("renda")
    .select("ID,TipoDeRenda,Nome,Data,Valor")
    .order("Data", { ascending: false })
    .order("ID", { ascending: false });

  if (error) {
    console.error("Erro ao consultar rendas:", error.message);
    return response.status(500).json({ error: "Não foi possível carregar as rendas." });
  }

  return response.json(data);
});

app.post("/api/rendas", async (request, response) => {
  const { TipoDeRenda, Nome, Data, Valor } = request.body ?? {};
  const parsedValue = Number(Valor);

  if (
    typeof TipoDeRenda !== "string" ||
    !TipoDeRenda.trim() ||
    typeof Nome !== "string" ||
    !Nome.trim() ||
    typeof Data !== "string" ||
    !isValidDate(Data) ||
    !Number.isFinite(parsedValue) ||
    parsedValue <= 0
  ) {
    return response.status(400).json({
      error: "Informe o tipo, o nome, uma data válida e um valor maior que zero.",
    });
  }

  const { data, error } = await supabase
    .from("renda")
    .insert({
      TipoDeRenda: TipoDeRenda.trim(),
      Nome: Nome.trim(),
      Data,
      Valor: parsedValue,
    })
    .select("ID,TipoDeRenda,Nome,Data,Valor")
    .single();

  if (error) {
    console.error("Erro ao cadastrar renda:", error.message);
    return response.status(500).json({ error: "Não foi possível cadastrar a renda." });
  }

  return response.status(201).json(data);
});

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});
