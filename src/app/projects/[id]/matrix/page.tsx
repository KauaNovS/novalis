"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  bedrooms: number;
  area: number;
  parkingSpaces: number;
  status: string;
  currentPrice: number | null;
  pricePerSquareMeter: number | null;
  typology: string | null;
}

interface Tower {
  id: string;
  name: string;
  floors: number;
  units: Unit[];
}

interface ProjectMatrix {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  state: string;
  towers: Tower[];
}

export default function UnitMatrixPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<ProjectMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setProject(data);
      })
      .catch(() => setError("Erro ao carregar projeto"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0f0f0f", padding: "32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "24px", padding: "32px", textAlign: "center" }}>
            <p style={{ color: "#888" }}>Carregando...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#0f0f0f", padding: "32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "24px", padding: "32px", textAlign: "center" }}>
            <p style={{ color: "#f87171" }}>{error || "Projeto não encontrado"}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0f0f0f", padding: "24px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <Link
          href={`/projects/${project.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#888",
            fontSize: "14px",
            marginBottom: "24px",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar para detalhes
        </Link>

        <h1 style={{ fontSize: "28px", fontWeight: "500", color: "white", marginBottom: "4px" }}>
          {project.name}
        </h1>
        <p style={{ color: "#888", fontSize: "14px" }}>
          {project.neighborhood} · {project.city}/{project.state}
        </p>

        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {project.towers.map((tower) => {
            const floors = [...new Set(tower.units.map((u) => u.floor))].sort((a, b) => b - a);

            return (
              <div
                key={tower.id}
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "24px",
                  padding: "24px",
                }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: "500", color: "#e5e5e5", marginBottom: "16px" }}>
                  {tower.name}
                  <span style={{ color: "#666", fontSize: "14px", marginLeft: "8px" }}>
                    ({tower.units.length} unidades)
                  </span>
                </h2>

                {floors.length === 0 ? (
                  <p style={{ color: "#666", fontSize: "14px" }}>Nenhuma unidade cadastrada.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {floors.map((floor) => {
                      const floorUnits = tower.units
                        .filter((u) => u.floor === floor)
                        .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));

                      return (
                        <div key={floor} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{ width: "40px", color: "#666", fontSize: "14px", fontWeight: "500", paddingTop: "8px" }}>
                            {floor}º
                          </div>
                          <div
                            style={{
                              flex: 1,
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                              gap: "12px",
                            }}
                          >
                            {floorUnits.map((unit) => {
                              return (
                                <div
                                  key={unit.id}
                                  onClick={() => router.push(`/units/${unit.id}`)}
                                  style={{
                                    backgroundColor: "#222",
                                    border: "1px solid #333",
                                    borderRadius: "20px",
                                    padding: "16px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#2a2a2a";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.5)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#222";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                      <p style={{ fontSize: "18px", fontWeight: "600", color: "white", lineHeight: "1.2" }}>
                                        {unit.unitNumber}
                                      </p>
                                      <p style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
                                        {unit.typology || "—"}
                                      </p>
                                    </div>
                                    {unit.status === "AVAILABLE" && (
                                      <span style={{
                                        backgroundColor: "rgba(16,185,129,0.2)",
                                        color: "#34d399",
                                        padding: "4px 8px",
                                        borderRadius: "999px",
                                        fontSize: "10px",
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                      }}>
                                        Disp.
                                      </span>
                                    )}
                                    {unit.status === "SOLD" && (
                                      <span style={{
                                        backgroundColor: "rgba(239,68,68,0.2)",
                                        color: "#f87171",
                                        padding: "4px 8px",
                                        borderRadius: "999px",
                                        fontSize: "10px",
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                      }}>
                                        Vend.
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ borderTop: "1px solid #333", margin: "12px 0 8px" }} />

                                  <div style={{ fontSize: "13px", color: "#ccc", display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span style={{ color: "#999" }}>Área</span>
                                      <span style={{ color: "white" }}>{unit.area.toFixed(1)} m²</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span style={{ color: "#999" }}>Vagas</span>
                                      <span style={{ color: "white" }}>{unit.parkingSpaces}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span style={{ color: "#999" }}>R$/m²</span>
                                      <span style={{ color: "white" }}>
                                        {unit.pricePerSquareMeter
                                          ? `R$ ${unit.pricePerSquareMeter.toLocaleString("pt-BR")}`
                                          : "—"}
                                      </span>
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      backgroundColor: "rgba(255,255,255,0.05)",
                                      borderRadius: "12px",
                                      padding: "10px 12px",
                                      marginTop: "10px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
                                      {unit.currentPrice
                                        ? `R$ ${unit.currentPrice.toLocaleString("pt-BR")}`
                                        : "Sob consulta"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}