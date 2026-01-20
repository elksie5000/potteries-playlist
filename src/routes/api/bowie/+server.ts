import { json } from "@sveltejs/kit";
import bowieData from "../../../../bowie.json";

export function GET() {
    return json(bowieData);
}