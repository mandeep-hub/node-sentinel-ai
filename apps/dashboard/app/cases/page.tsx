import CasesView from "./CasesView";

export default async function CasesPage() {
  const response = await fetch(`http://localhost:3000/api/cases`);
  const cases = await response.json();
  return (
    <div>
      <CasesView cases={cases} />
    </div>
  );
}
