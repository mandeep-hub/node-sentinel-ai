import CasesView from "./CasesView";

export default async function CasesPage() {
  const response = await fetch(`http://localhost:3000/api/cases`);
  const cases = await response.json();
  console.log("Cases:", cases);
  return (
    <div>
      <CasesView cases={cases} />
    </div>
  );
}
