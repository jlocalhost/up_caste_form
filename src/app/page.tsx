import SurveyForm from "@/features/survey/components/SurveyForm";
import { getSurveyConfig } from "@/features/survey/data/survey-repository";

export default async function Home() {
  const { districts, castes } = await getSurveyConfig();
  return <SurveyForm districts={districts} castes={castes} />;
}
