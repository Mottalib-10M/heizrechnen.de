import { defineGuide } from '../../lib/guide-types';
import { foerderung, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizungsförderung beantragen: die sechs Schritte des Merkblatts 458 (S. 3), Vertrag mit Bedingung (Richtlinie Nr. 9.2.1,
 * Merkblatt S. 6), Bewilligungszeitraum und Nachweisfrist (Merkblatt S. 7), Unterlagen (S. 8). Eigenes Beispiel:
 * Zusage im November 2026, letzte Rechnung im April 2027; Haushalt mit 65.000 € vor und nach dem 1. Februar 2027.
 */
const F = P.foerderung;
const heute = P.retrieved_at;
const plusMonate = (iso: string, m: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString().slice(0, 10); };
const zusage = '2026-11-16';
const ende = plusMonate(zusage, F.bewilligung_monate);
const letzteRechnung = '2027-04-20';
const nachweis = plusMonate(letzteRechnung, F.nachweis_monate);
const nachweisSpaet = plusMonate(ende, F.nachweis_monate);
const stichtag = F.kgb_stufen[1].ab;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 32000, selbstnutzer: true, alt: 'oel', altJahre: 27, neu: 'wp', wpEU: true, zve: 65000, kind: false };
const vorher = foerderung({ ...b, antrag: '2027-01-29' });
const nachher = foerderung({ ...b, antrag: stichtag });
const dt = (iso: string, l: 'de' | 'en') => new Date(`${iso}T00:00:00Z`).toLocaleDateString(l === 'en' ? 'en-GB' : 'de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default defineGuide({
  id: 'foerderantrag',
  group: 'foerderung',
  order: 110,
  mini: 'fristen',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'waermepumpe-foerderung', 'einkommensbonus', 'klimageschwindigkeitsbonus', 'ergaenzungskredit', 'weg'],
  sources: ['merkblatt458', 'begem2026', 'kfw458', 'bmweFaq'],
  de: {
    slug: 'heizungsfoerderung-antrag',
    nav: 'Antrag stellen',
    card: 'Vom Angebot bis zur Auszahlung: Bestätigung zum Antrag, Vertrag mit Förderklausel, Portal „Meine KfW“, Fristen und Belege.',
    title: 'Heizungsförderung Antrag 2026: Schritte, BzA und Fristen',
    description: `Heizungsförderung Antrag 2026: BzA, Vertrag mit Förderklausel, Antrag in „Meine KfW“, ${F.bewilligung_monate} Monate für den Einbau, ${F.nachweis_monate} Monate für die Nachweise. Die Fallen.`,
    h1: 'Heizungsförderung Antrag: die sechs Schritte und ihre Fristen',
    intro: 'Der Zuschuss scheitert selten an der Technik, oft aber an der Reihenfolge. Hier steht, welches Papier wann vorliegen muss und welche Frist ab wann läuft.',
    resume: `Die Heizungsförderung der KfW wird vor Beginn des Vorhabens im Kundenportal „Meine KfW“ beantragt. Zuerst erstellt ein Fachbetrieb oder ein Energieeffizienz-Experte die Bestätigung zum Antrag (BzA) mit der geplanten Heizung und den Kosten. Dann schließen Sie mit dem Fachbetrieb einen Vertrag, der nur bei Förderzusage gilt oder ohne sie entfällt und ein voraussichtliches Einbaudatum nennt. Mit BzA und Vertrag stellen Sie den Antrag. Nach der Zusage haben Sie ${F.bewilligung_monate} Monate für den Einbau, danach bestätigt der Fachbetrieb die Durchführung, und Sie reichen binnen ${F.nachweis_monate} Monaten nach der letzten Rechnung die Nachweise ein. Für Satz und Höchstbetrag zählt der Tag, an dem der Antrag eingeht. Ein Haushalt mit ${DE.eur(65000)} Einkommen, der eine Ölheizung gegen eine Wärmepumpe zu ${DE.eur(32000)} tauscht, erhält bei Antrag Ende Januar 2027 ${DE.eur(vorher.zuschuss)}, ab dem 1. Februar 2027 ${DE.eur(nachher.zuschuss)}. Bei einer Zusage am ${dt(zusage, 'de')} muss die Heizung bis zum ${dt(ende, 'de')} fertig sein.`,
    faqs: [
      { q: 'Wie muss die Förderklausel im Vertrag aussehen?', a: 'Eine feste Formulierung gibt die KfW nicht vor. Der Vertrag muss eine aufschiebende Bedingung enthalten, dann wird er erst mit der Zusage wirksam, oder eine auflösende, dann entfällt er bei Ablehnung. Außerdem muss er das voraussichtliche Datum des Einbaus nennen, und zwar innerhalb des Bewilligungszeitraums. Die Klausel muss beim Unterschreiben drinstehen; ein späterer Nachtrag ist nicht zulässig.' },
      { q: 'Wie lange ist die Bestätigung zum Antrag gültig?', a: 'Sechs Monate ab Erstellung. Das ergibt sich aus den Antworten des Ministeriums zur Umstellung im Juli 2026, nach denen bestehende Bestätigungen wie gewohnt sechs Monate gelten. Läuft die Frist ab, bevor Sie den Antrag stellen, muss der Fachbetrieb oder Experte eine neue erstellen. Eine Bestätigung aus der Zeit vor dem 21. Juli 2026 kann weiter genutzt werden, der Antrag läuft dann aber nach den neuen Bedingungen.' },
      { q: 'Darf mein Sohn den Antrag für mich stellen?', a: 'Nein. Wer sich im Portal „Meine KfW“ registriert, muss dieselbe Person sein, die den Antrag stellt, und das muss der Eigentümer sein. Eine Vollmacht für Dritte lässt die KfW nur bei Anträgen einer Wohnungseigentümergemeinschaft zu. Helfen darf Ihr Sohn natürlich, etwa beim Hochladen der Unterlagen, aber Registrierung und Antrag laufen auf Ihren Namen. Die registrierte Person lässt sich später nicht austauschen.' },
      { q: 'Was passiert, wenn die Heizung teurer wird als beantragt?', a: `Der Zuschuss steigt nicht mit. Die KfW lässt nur einen Antrag je Maßnahme zu, und eine Aufstockung über den beantragten Umfang hinaus ist nicht möglich. Liegen die Kosten ohnehin über dem Höchstbetrag von ${DE.eur(F.hoechst_erste_we[0].betrag)}, ändert sich am Zuschuss nichts. Liegen sie darunter, lohnt es sich, schon in der BzA realistische Kosten mit Puffer anzugeben. Fallen die Kosten niedriger aus, zahlt die KfW auf die tatsächlichen Kosten.` },
      { q: 'Bis wann muss ich die Rechnungen hochladen?', a: `Binnen ${F.nachweis_monate} Monaten nach Abschluss des Vorhabens, gemessen am Datum der letzten Rechnung, spätestens aber ${F.nachweis_monate} Monate nach Ende des Bewilligungszeitraums. Wer im Beispiel die letzte Rechnung am ${dt(letzteRechnung, 'de')} erhält, hat bis zum ${dt(nachweis, 'de')} Zeit. Verpasst man die Frist, verfällt der Zuschuss. Die Rechnungen müssen auf Deutsch und in Euro ausgestellt und unbar bezahlt sein.` },
    ],
    body: (h) => `
<h2>Die sechs Schritte im Überblick</h2>
<p>Das ${h.src('merkblatt458', 'Merkblatt 458')} beschreibt den Weg zum Zuschuss in sechs Schritten. Die ersten drei müssen in dieser Reihenfolge erledigt sein, bevor auf der Baustelle irgendetwas passiert.</p>
${h.table(['Schritt', 'Wer', 'Was entsteht'], [
  ['1. Bestätigung zum Antrag', 'Fachbetrieb oder Energieeffizienz-Experte', 'BzA mit geplanter Heizung, Kosten und Einhaltung der technischen Mindestanforderungen'],
  ['2. Vertrag mit Förderklausel', 'Sie und der Fachbetrieb', 'Liefer- oder Leistungsvertrag mit Bedingung und voraussichtlichem Einbaudatum'],
  ['3. Antrag', 'Sie, im Portal „Meine KfW“', 'Antrag für das Produkt 458 mit hochgeladener BzA und Vertrag'],
  ['4. Einbau', 'Fachbetrieb', `fertige Heizung, höchstens ${F.bewilligung_monate} Monate nach der Zusage`],
  ['5. Bestätigung nach Durchführung', 'derselbe Fachbetrieb oder Experte', 'BnD mit tatsächlichen Kosten'],
  ['6. Nachweis und Auszahlung', 'Sie, im Portal', 'Identifizierung, Rechnungen, Belege für Boni, Überweisung'],
], 'Merkblatt 458, Stand 09/2026', ['l', 'l', 'l'])}

<h2>Schritt 1: die Bestätigung zum Antrag</h2>
<p>Ohne BzA nimmt das Portal keinen Antrag an. Sie enthält die geplante Heizung, die voraussichtlichen förderfähigen Kosten und die Bestätigung, dass die technischen Mindestanforderungen eingehalten werden, bei einer Wärmepumpe etwa die Jahresarbeitszahl. Erstellen darf sie ein Fachunternehmen, in der Regel der Installateur, oder ein Experte aus der Energieeffizienz-Expertenliste des Bundes. Die BzA gilt sechs Monate. Wer mehrere Angebote vergleicht, lässt sie erst für das Angebot erstellen, das er annehmen will, denn die Kosten darin begrenzen später den Zuschuss.</p>

<h2>Schritt 2: der Vertrag mit Förderklausel</h2>
<p>Hier gehen die meisten Förderungen verloren. Vor dem Antrag muss ein Liefer- oder Leistungsvertrag vorliegen, der unter einer aufschiebenden oder auflösenden Bedingung der Förderzusage geschlossen wurde (${h.src('begem2026', 'Richtlinie BEG EM, Nr. 9.2.1')}). Aufschiebend heißt: Der Vertrag ist bis zur Zusage schwebend unwirksam und wird bei Ablehnung endgültig unwirksam. Auflösend heißt: Er gilt sofort, entfällt aber, wenn die Zusage ausbleibt. Der Vertrag muss außerdem das voraussichtliche Datum der Umsetzung nennen, und dieses Datum muss im Bewilligungszeitraum liegen.</p>
<p>Ein Vertrag ohne diese Bedingung gilt als Beginn des Vorhabens, genauso wie der tatsächliche Start der Arbeiten vor Ort. Liegt der Beginn vor dem Antrag, ist die Förderung ausgeschlossen. Eine Bedingung, die erst nachträglich in einen schon unterschriebenen Vertrag aufgenommen wird, erkennt die KfW nicht an. Planung, Beratung und Energieberatung dürfen dagegen jederzeit vorher stattfinden.</p>

<h2>Schritt 3: der Antrag im Portal</h2>
<p>Sie registrieren sich unter meine.kfw.de und wählen das Produkt „BEG Heizungsförderung für Privatpersonen, Wohngebäude (458)“. Hochgeladen werden BzA und Vertrag. Die Person, die sich registriert, muss dieselbe sein, die den Antrag stellt, und lässt sich später nicht austauschen. Eine Vertretung durch Bevollmächtigte erlaubt die KfW nur bei Wohnungseigentümergemeinschaften (${h.a('weg', 'Heizungsförderung in der WEG')}). Das Portal kann zeitweise einen virtuellen Warteraum vorschalten und nachts geschlossen sein.</p>
<p>Je Maßnahme gibt es nur einen Antrag, und der beantragte Betrag lässt sich später nicht erhöhen. Die Boni wählen Sie gleich mit aus; eine nachträgliche Änderung ist grundsätzlich nicht möglich (${h.src('kfw458', 'Produktseite KfW 458')}). Der Tag des Eingangs bestimmt den Satz. Im Beispiel mit ${h.eur(65000)} Einkommen und Ölheizung sind es ${h.eur(vorher.zuschuss)} bei einem Antrag Ende Januar 2027 und ${h.eur(nachher.zuschuss)} ab dem ${h.date(stichtag)}, weil an diesem Tag ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')} und Höchstbetrag sinken.</p>
<!--mini:warten-->

<h2>Schritte 4 bis 6: Einbau, Bestätigung, Nachweis</h2>
<p>Nach dem Eingang des Antrags darf der Einbau beginnen, vor der Zusage aber auf eigenes Risiko. Ab der Zusage laufen ${F.bewilligung_monate} Monate, in denen das Vorhaben vollständig abgeschlossen sein muss. Danach erstellt der Fachbetrieb oder Experte die Bestätigung nach Durchführung (BnD) mit den tatsächlichen Kosten. Mit deren Nummer starten Sie im Portal den Nachweis. Vorher müssen Sie sich dort identifizieren, und Sie brauchen Ihre steuerliche Identifikationsnummer.</p>
${h.table(['Ereignis', 'Datum im Beispiel', 'Regel'], [
  ['Zusage der KfW', h.date(zusage), 'Beginn des Bewilligungszeitraums'],
  ['Letzte Rechnung', h.date(letzteRechnung), 'Abschluss des Vorhabens'],
  ['Nachweis spätestens', h.date(nachweis), `${F.nachweis_monate} Monate nach der letzten Rechnung`],
  ['Einbau spätestens fertig', h.date(ende), `${F.bewilligung_monate} Monate nach der Zusage`],
  ['Absolute Grenze für den Nachweis', h.date(nachweisSpaet), `${F.nachweis_monate} Monate nach Ende des Bewilligungszeitraums`],
], 'Merkblatt 458, S. 7; maßgeblich sind die Daten im Zuwendungsbescheid', ['l', 'r', 'l'])}
<p>Verpasst man die Nachweisfrist, verfällt der Zuschuss. Für Anträge mit Einkommensbonus soll das Einreichen der Nachweise laut Merkblatt voraussichtlich ab Januar 2027 möglich sein. Die Auszahlung erfolgt nach positiver Prüfung meist zur Mitte oder zum Ende eines Monats auf Ihr Konto.</p>

<h2>Welche Unterlagen der Nachweis braucht</h2>
<p>Die Rechnungen müssen den Anforderungen des Umsatzsteuergesetzes genügen, die Adresse des Hauses und die förderfähigen Kosten ausweisen, auf Deutsch und in Euro ausgestellt und unbar bezahlt sein. Für den hydraulischen Abgleich kann die KfW ein Formular des Branchenverbands VdZ anfordern. Wer den ${h.a('klimageschwindigkeitsbonus', 'Klimabonus')} will, lädt die Meldebestätigung und einen Grundbuchauszug hoch; für den ${h.a('einkommensbonus', 'Einkommensbonus')} kommen die Einkommensteuerbescheide des zweiten und dritten Jahres vor dem Antrag und die Meldebestätigungen aller zählenden Haushaltsmitglieder dazu.</p>

<h2>Nach der Auszahlung</h2>
<p>Die Heizung muss ${F.nutzungspflicht_jahre} Jahre zweckentsprechend genutzt werden. Wer das Haus in dieser Zeit verkauft, muss den Käufer laut Richtlinie auf die Förderung und die Nutzungspflicht hinweisen und die Pflichten im Kaufvertrag übertragen. Zahlt die KfW in einem Kalenderjahr insgesamt mindestens ${h.eur(3000)} aus, meldet sie das an die Finanzbehörden. Wer auf eine Zusage verzichtet, kann für dasselbe Vorhaben frühestens sechs Monate später neu beantragen. Den Eigenanteil kann der ${h.a('ergaenzungskredit', 'Ergänzungskredit')} finanzieren, der erst nach der Zusage beantragt wird. Das Programm im Ganzen beschreibt ${h.a('kfw-458', 'KfW 458')}, die Höhe für Ihren Fall zeigt der ${h.a('waermepumpe-foerderung', 'Förderrechner')}.</p>`,
  },
  en: {
    slug: 'heating-grant-application',
    nav: 'How to apply',
    card: 'From quote to payout: confirmation for the application, contract with a grant clause, the “Meine KfW” portal, deadlines and proof.',
    title: 'Heating Grant Application 2026: Steps, BzA and Deadlines',
    description: `Heating grant application 2026: confirmation (BzA), contract with grant clause, application in the “Meine KfW” portal, ${F.bewilligung_monate} months to install, ${F.nachweis_monate} months for proof.`,
    h1: 'Applying for the German heating grant: six steps and their deadlines',
    intro: 'The grant rarely fails on technology, but often on the order of events. This page shows which document must exist when, and when each deadline starts to run.',
    resume: `The KfW heating grant is applied for online in the “Meine KfW” customer portal before the project starts. First an installer or a listed energy efficiency expert prepares the confirmation for the application (Bestätigung zum Antrag, BzA) with the planned system and its cost. Then you sign a contract with the installer that only takes effect on approval, or lapses without it, and states an expected installation date. With the BzA and the contract you apply. After approval you have ${F.bewilligung_monate} months to install; the installer then confirms the work, and you submit evidence within ${F.nachweis_monate} months of the last invoice. The rate and the cap depend on the day KfW receives the application. A household on ${EN.eur(65000)} replacing an oil boiler with a ${EN.eur(32000)} heat pump gets ${EN.eur(vorher.zuschuss)} if it applies at the end of January 2027, but ${EN.eur(nachher.zuschuss)} from 1 February 2027. With approval on ${dt(zusage, 'en')}, the system must be finished by ${dt(ende, 'en')}.`,
    faqs: [
      { q: 'How should the grant clause in the installer’s contract read?', a: 'KfW does not prescribe wording. The contract needs either a condition precedent, so it only takes effect once approval arrives, or a condition subsequent, so it falls away if the application is refused. It must also state the expected installation date, which has to fall within the approval period. The clause must be there when you sign; adding it later is not accepted.' },
      { q: 'How long does a confirmation for the application stay valid?', a: 'Six months from the day it was issued. The ministry confirmed this when explaining the July 2026 changeover, saying existing confirmations remain valid for six months as usual. If it expires before you apply, the installer or expert has to issue a new one. A confirmation from before 21 July 2026 can still be used, but the application then follows the new rules.' },
      { q: 'Can a relative in Germany apply on my behalf while I live abroad?', a: 'No. The person who registers in the “Meine KfW” portal must be the person applying, and that must be the owner. KfW accepts powers of attorney only for applications by an owners’ association. A relative can help, for example with uploading documents, but registration and application run in your name, and the registered person cannot be changed later. Note that the bonuses also require Germany to be your main residence.' },
      { q: 'What if the final bill is higher than the amount applied for?', a: `The grant does not rise with it. KfW allows only one application per measure and no increase beyond the amount applied for. If the cost is above the ${EN.eur(F.hoechst_erste_we[0].betrag)} cap anyway, nothing changes. If it is below, it pays to state realistic costs with some margin in the BzA. If the work comes in cheaper, KfW pays on the actual cost.` },
      { q: 'Do the installer’s invoices have to be in German?', a: 'Yes. The information sheet requires invoices drawn up in German and in euros, meeting the requirements of the German VAT Act, showing the address of the property and the eligible costs. They must be paid by bank transfer or another cashless method, never in cash. Keep the payment records, because the invoices are checked against the confirmation after completion.' },
    ],
    body: (h) => `
<h2>The six steps at a glance</h2>
<p>${h.src('merkblatt458', 'Information sheet 458')} sets out the route to the grant in six steps. The first three must be done in this order before anything happens on site. Every document and the portal are in German only.</p>
${h.table(['Step', 'Who', 'Result'], [
  ['1. Confirmation for the application', 'installer or energy efficiency expert', 'BzA with planned system, costs and compliance with technical minimum requirements'],
  ['2. Contract with grant clause', 'you and the installer', 'supply or service contract with a condition and expected installation date'],
  ['3. Application', 'you, in the “Meine KfW” portal', 'application for product 458 with BzA and contract uploaded'],
  ['4. Installation', 'installer', `finished system, at most ${F.bewilligung_monate} months after approval`],
  ['5. Confirmation after completion', 'the same installer or expert', 'BnD with actual costs'],
  ['6. Evidence and payout', 'you, in the portal', 'identification, invoices, bonus documents, bank transfer'],
], 'Information sheet 458, edition 09/2026', ['l', 'l', 'l'])}

<h2>Step 1: the confirmation for the application</h2>
<p>Without a BzA the portal will not take an application. It records the planned system, the expected eligible costs and confirmation that the technical minimum requirements are met, for a heat pump for example the seasonal performance factor. It can be issued by a registered installer or by an expert from the federal list of energy efficiency experts. A BzA is valid for six months. If you are comparing quotes, have it issued only for the one you intend to accept, because the costs it states later limit the grant.</p>

<h2>Step 2: the contract with a grant clause</h2>
<p>This is where most grants are lost. Before applying, you need a supply or service contract concluded under a condition precedent or subsequent tied to grant approval (${h.src('begem2026', 'BEG EM guideline, no. 9.2.1')}). A condition precedent means the contract is suspended until approval and void if the application is refused. A condition subsequent means it applies at once but falls away without approval. The contract must also state the expected installation date, and that date must fall within the approval period.</p>
<p>A contract without such a condition counts as starting the project, as does actual work on site. If the project starts before the application, the grant is excluded. A condition added to a contract already signed is not recognised. Planning, advice and an energy consultation may take place beforehand at any time.</p>

<h2>Step 3: applying in the portal</h2>
<p>You register at meine.kfw.de and choose the product for private owners of residential buildings (458). You upload the BzA and the contract. The person who registers must be the person who applies and cannot be swapped later. KfW accepts representatives only for owners’ associations (${h.a('weg', 'heating grant in a WEG')}). The portal may put you in a virtual queue and may be closed at night.</p>
<p>Each measure allows one application, and the amount cannot be increased later. You select the bonuses at the same time; changing them afterwards is generally not possible (${h.src('kfw458', 'KfW 458 product page')}). The day the application arrives sets the rate. In the example with ${h.eur(65000)} income and an oil boiler, that is ${h.eur(vorher.zuschuss)} with an application at the end of January 2027 and ${h.eur(nachher.zuschuss)} from ${h.date(stichtag)}, because the ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')} and the cap both fall that day.</p>
<!--mini:warten-->

<h2>Steps 4 to 6: installation, confirmation, evidence</h2>
<p>Once the application has arrived, installation may start, though before approval at your own risk. From approval you have ${F.bewilligung_monate} months to finish the project completely. The installer or expert then issues the confirmation after completion (Bestätigung nach Durchführung, BnD) with the actual costs. You start the evidence process in the portal with its reference number. Before that you must identify yourself in the portal, and you need your German tax identification number (Steuer-IdNr).</p>
${h.table(['Event', 'Date in the example', 'Rule'], [
  ['KfW approval', h.date(zusage), 'start of the approval period'],
  ['Last invoice', h.date(letzteRechnung), 'project completed'],
  ['Evidence due', h.date(nachweis), `${F.nachweis_monate} months after the last invoice`],
  ['Installation finished at the latest', h.date(ende), `${F.bewilligung_monate} months after approval`],
  ['Absolute limit for evidence', h.date(nachweisSpaet), `${F.nachweis_monate} months after the approval period ends`],
], 'Information sheet 458, p. 7; the dates in your approval letter prevail', ['l', 'r', 'l'])}
<p>Miss the evidence deadline and the grant lapses. For applications with an income bonus, submitting evidence is expected to open from January 2027, according to the information sheet. After a positive check, the money is usually transferred around the middle or end of a month.</p>

<h2>What the evidence needs</h2>
<p>Invoices must meet the German VAT Act, show the property address and the eligible costs, be issued in German and in euros, and be paid without cash. KfW may ask for the heating industry association’s (VdZ) form confirming hydraulic balancing. For the ${h.a('klimageschwindigkeitsbonus', 'climate bonus')} you upload your registration certificate and a land register extract; for the ${h.a('einkommensbonus', 'income bonus')} you add the income tax assessments for the second and third year before the application and the registration certificates of all household members who count.</p>

<h2>After the payout</h2>
<p>The system must be used as intended for ${F.nutzungspflicht_jahre} years. If you sell within that time, the guideline requires you to tell the buyer about the grant and the duty of use and to pass the obligations on in the sale contract. If KfW pays you ${h.eur(3000)} or more in a calendar year, it reports this to the tax authorities. After withdrawing from an approval, you can reapply for the same project only six months later. Your own share can be financed with the ${h.a('ergaenzungskredit', 'top-up loan')}, which you apply for after approval. ${h.a('kfw-458', 'KfW 458')} describes the programme as a whole, and the ${h.a('waermepumpe-foerderung', 'grant calculator')} shows the amount for your case.</p>`,
  },
});
