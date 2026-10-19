import { defineGuide } from '../../lib/guide-types';
import { foerderung, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Ergänzungskredit 358/359 (Richtlinie BEG EM Nr. 8.1, 8.3.1 c, 8.5.2, 9.2.2; Produktseite kfw.de/358, gelesen am 19.10.2026):
 * bis 120.000 € je Wohneinheit, bis zur Summe der förderfähigen Kosten aus Zuschusszusage und BAFA-Bescheid,
 * Zinsvorteil (358) bis 90.000 € Haushaltseinkommen. Eigenes Beispiel: Wärmepumpe 42.000 € allein und mit Dachdämmung.
 * Zinssätze stehen auf der Produktseite nicht (Anzeige „-,-- %“): keine Rate, kein Zins im Text.
 */
const F = P.foerderung;
const K = F.kredit;
const heute = P.retrieved_at;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 42000, selbstnutzer: true, alt: 'oel', altJahre: 31, neu: 'wp', wpEU: true, zve: 70000, kind: false };
const heizung = foerderung(b);
const ueberHoechst = b.kosten - heizung.foerderfaehig;
const dach = P.bafa.hoechst_erste_we;
const mitDach = heizung.foerderfaehig + dach;
const klein = foerderung({ ...b, kosten: 24000, zve: 38000 });
const zweiFamilie = foerderung({ ...b, gebaeude: 'mfh', einheiten: 2, kosten: 50000, zve: 120000 });

export default defineGuide({
  id: 'ergaenzungskredit',
  group: 'foerderung',
  order: 111,
  mini: 'kredit',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'waermepumpe-foerderung', 'foerderantrag', 'heizungstausch-kosten', 'steuerbonus-35c', 'heizungsoptimierung'],
  sources: ['kfw358', 'merkblatt358', 'begem2026', 'merkblatt458'],
  de: {
    slug: 'ergaenzungskredit-heizung',
    nav: 'Ergänzungskredit',
    card: `Der Förderkredit zum Zuschuss: bis ${DE.eur(K.hoechst_je_we)} je Wohnung, aber nur bis zu den förderfähigen Kosten der Zusage. 358 oder 359, Fristen, Tilgung.`,
    title: 'KfW Ergänzungskredit 2026: 358 und 359 für die Heizung',
    description: `KfW Ergänzungskredit 2026: bis ${DE.eur(K.hoechst_je_we)} je Wohnung zum Heizungszuschuss, Zinsvorteil bis ${DE.eur(K.zinsverbilligung_zve_bis)} Einkommen. Wie viel er deckt und wann der Antrag fällig ist.`,
    h1: 'KfW Ergänzungskredit: den Eigenanteil der neuen Heizung finanzieren',
    intro: 'Der Zuschuss kommt erst nach dem Einbau, die Rechnung schon vorher. Der Ergänzungskredit schließt diese Lücke, aber nicht in jeder Höhe und nicht für jeden zum selben Zins.',
    resume: `Der KfW Ergänzungskredit ist ein Förderkredit für Eigentümer, die bereits eine Zusage für die Heizungsförderung 458 oder einen BAFA-Bescheid für eine andere Einzelmaßnahme haben. Er finanziert bis zu ${DE.eur(K.hoechst_je_we)} je Wohnung, höchstens aber die förderfähigen Kosten, die in Zusage und Bescheid stehen, und zwar einschließlich des Teils, den der Zuschuss später deckt. Selbstnutzer eines Einfamilienhauses oder einer Eigentumswohnung mit höchstens ${DE.eur(K.zinsverbilligung_zve_bis)} Haushaltseinkommen erhalten als Kredit 358 einen zusätzlichen Zinsvorteil, alle anderen den Kredit 359. Beantragt wird bei einer Bank, nicht bei der KfW, binnen zwölf Monaten nach der Zusage und bevor der Zuschuss ausgezahlt ist. Beispiel: Eine Wärmepumpe kostet ${DE.eur(b.kosten)}, die Ölheizung wird ersetzt, das Einkommen liegt bei ${DE.eur(b.zve)}. Förderfähig sind ${DE.eur(heizung.foerderfaehig)}, der Zuschuss beträgt ${DE.eur(heizung.zuschuss)}. Der Kredit kann bis ${DE.eur(heizung.foerderfaehig)} vorfinanzieren, die übrigen ${DE.eur(ueberHoechst)} über dem Höchstbetrag braucht eine andere Finanzierung.`,
    faqs: [
      { q: 'Wie hoch darf der Ergänzungskredit für eine Heizung allein sein?', a: `So hoch wie die förderfähigen Kosten in der Zuschusszusage, für das erste Haus bei Antrag bis zum 31. Januar 2027 also bis ${DE.eur(F.hoechst_erste_we[0].betrag)}. Die Grenze von ${DE.eur(K.hoechst_je_we)} je Wohnung erreicht man nur, wenn weitere Maßnahmen mit BAFA-Bescheid hinzukommen, etwa Dämmung oder Fenster. Kosten über dem Höchstbetrag deckt der Kredit nicht.` },
      { q: 'Was unterscheidet den Kredit 358 vom Kredit 359?', a: `Der Zinsvorteil. Den Kredit 358, „Ergänzungskredit Plus“, bekommen Eigentümer eines Einfamilienhauses oder einer Eigentumswohnung mit Maßnahme am Sondereigentum, die dort mit Hauptwohnsitz wohnen und höchstens ${DE.eur(K.zinsverbilligung_zve_bis)} Haushaltseinkommen haben. Für sie wird der Zins in der ersten Zinsbindung zusätzlich verbilligt. Alle anderen, auch Vermieter, Eigentümer ungeteilter Mehrfamilienhäuser und Eigentümergemeinschaften, nutzen den Kredit 359.` },
      { q: 'Bis wann muss ich den Ergänzungskredit beantragen?', a: 'Binnen zwölf Monaten nach der Zusage der KfW oder dem Bescheid des BAFA, und solange der Zuschuss noch nicht ausgezahlt ist. Mit dem Einbau dürfen Sie nach der Zuschusszusage schon beginnen, bevor der Kredit beantragt ist. Nach der Kreditzusage haben Sie zwölf Monate für den Abruf des Geldes; eine Verlängerung auf höchstens 36 Monate ist möglich, kostet aber ab dem 13. Monat eine Bereitstellungsprovision.' },
      { q: 'Kann ich den Kredit mit dem ausgezahlten Zuschuss tilgen?', a: 'Ja, und dafür ist er gedacht. Innerhalb der ersten Zinsbindung können Sie jederzeit ohne Vorfälligkeitsentschädigung vorzeitig zurückzahlen, sofern der Betrag den Mindestbetrag der KfW erreicht. Führen Sie den Zuschuss über die Bank an die KfW zurück, verkürzt sich die Laufzeit. Auf Antrag kann die Bank stattdessen die Raten verringern. Nach der ersten Zinsbindung geht eine Sondertilgung nur vollständig und gegen Entschädigung.' },
      { q: 'Verlangt die Bank für den Ergänzungskredit Sicherheiten?', a: 'Das entscheidet die Bank. Die KfW schreibt dazu nur, dass Art und Höhe der Sicherheiten mit dem Finanzierungspartner vereinbart werden. Die KfW selbst legt dafür keine festen Regeln für Privatkunden offen, deshalb unterscheiden sich die Angebote der Banken. Fragen Sie danach, bevor Sie die Bank wählen, denn Antrag und Vertrag laufen ausschließlich über sie.' },
    ],
    body: (h) => `
<h2>Wozu der Kredit da ist</h2>
<p>Der Zuschuss aus der Heizungsförderung wird erst ausgezahlt, wenn die Heizung läuft und die Nachweise geprüft sind. Der Fachbetrieb will sein Geld früher. Der Ergänzungskredit finanziert deshalb nicht nur den Eigenanteil, sondern auf Wunsch die gesamten förderfähigen Kosten vor, bis zu ${h.pct(1)} davon. Kommt der Zuschuss, zahlen Sie ihn als Sondertilgung zurück. Der Kredit ist Teil derselben Richtlinie wie der Zuschuss (${h.src('begem2026', 'Richtlinie BEG EM, Nr. 8.1')}) und darf ausdrücklich mit ihm kombiniert werden, obwohl sonst für dieselben Kosten nur eine Förderung zulässig ist.</p>
<p>Voraussetzung ist eine Zuschusszusage der KfW oder ein Zuwendungsbescheid des BAFA nach der Richtlinie für Einzelmaßnahmen auf Ihren Namen. Sie darf nicht älter als zwölf Monate sein, und der Zuschuss darf noch nicht ausgezahlt sein. Wer erst baut und dann merkt, dass das Geld knapp wird, muss also rechtzeitig handeln.</p>

<h2>358 oder 359: wer welchen Kredit bekommt</h2>
${h.table(['Kredit', 'Für wen', 'Besonderheit'], [
  ['358, Ergänzungskredit Plus', `Selbstnutzer eines Einfamilienhauses oder einer Wohnung mit Maßnahme am Sondereigentum, Hauptwohnsitz, Haushaltseinkommen bis ${h.eur(K.zinsverbilligung_zve_bis)}`, 'zusätzlicher Zinsvorteil in der ersten Zinsbindung'],
  ['359, Ergänzungskredit', 'alle übrigen Eigentümer eines Einfamilienhauses, Vermieter, Eigentümer ungeteilter Mehrfamilienhäuser', 'gleiche Laufzeiten, ohne Zusatzvorteil'],
  ['359 für die WEG', 'Eigentümergemeinschaft bei Maßnahmen am Gemeinschaftseigentum', 'gemeinsamer Antrag durch eine bevollmächtigte Person'],
], 'Produktseite KfW 358/359, Stand Oktober 2026', ['l', 'l', 'l'])}
<p>Für den Kredit 358 verlangt die Bank dieselben Belege wie die KfW beim Einkommensbonus: Grundbuchauszug, Meldebestätigungen aller relevanten Haushaltsmitglieder und deren Einkommensteuerbescheide aus dem zweiten und dritten Kalenderjahr vor dem Kreditantrag. Die Grenze von ${h.eur(K.zinsverbilligung_zve_bis)} liegt deutlich über der des ${h.a('einkommensbonus', 'Einkommensbonus')} von ${h.eur(F.einkommen_stufen[2].bis)}; auch wer keinen Bonus mehr bekommt, kann also den Zinsvorteil erhalten. Wie groß er ist, legt die Richtlinie nur als Obergrenze für den Abstand zu den Refinanzierungskosten der KfW fest (Nr. 8.5.2). Konkrete Zinssätze zeigt die ${h.src('kfw358', 'Produktseite der KfW')} derzeit nicht an.</p>

<h2>Wie viel der Kredit wirklich deckt</h2>
<p>Die Kredithöhe richtet sich nach den förderfähigen Kosten aus der Zusage der KfW und dem Bescheid des BAFA zusammen. Die Obergrenze von ${h.eur(K.hoechst_je_we)} je Wohnung ist großzügig, aber sie greift erst, wenn mehrere Maßnahmen gefördert werden. Für eine neue Heizung allein begrenzt der Höchstbetrag der Heizungsförderung den Kredit.</p>
${h.table(['Vorhaben', 'Kosten', 'förderfähig', 'Zuschuss', 'Kredit höchstens'], [
  ['Wärmepumpe allein, Ölheizung ersetzt, Einkommen 70.000 €', h.eur(b.kosten), h.eur(heizung.foerderfaehig), h.eur(heizung.zuschuss), h.eur(heizung.foerderfaehig)],
  ['dieselbe Wärmepumpe und Dachdämmung mit BAFA-Bescheid', `${h.eur(b.kosten)} plus Dach`, h.eur(mitDach), 'KfW und BAFA', h.eur(Math.min(mitDach, K.hoechst_je_we))],
  ['kleine Wärmepumpe, Einkommen 38.000 €', h.eur(klein.foerderfaehig), h.eur(klein.foerderfaehig), h.eur(klein.zuschuss), h.eur(klein.foerderfaehig)],
  ['Zweifamilienhaus, Selbstnutzer in einer Wohnung, Einkommen 120.000 €', h.eur(50000), h.eur(zweiFamilie.foerderfaehig), h.eur(zweiFamilie.zuschuss), h.eur(zweiFamilie.foerderfaehig)],
], `Antrag im Oktober 2026; BAFA-Höchstgrenze für Dämmung ${h.eur(dach)} je erste Wohnung ohne Sanierungsfahrplan`, ['l', 'r', 'r', 'r', 'r'])}
<p>Im ersten Fall liegen ${h.eur(ueberHoechst)} der Rechnung über dem Höchstbetrag. Diesen Teil trägt weder der Zuschuss noch der Ergänzungskredit; er muss aus Ersparnissen oder einem gewöhnlichen Kredit kommen. Der Rechner oben zeigt die Lücke nach dem Zuschuss, wie viel davon der Förderkredit tragen darf, begrenzen die förderfähigen Kosten. Mit der Dachdämmung wächst der mögliche Kredit auf ${h.eur(Math.min(mitDach, K.hoechst_je_we))}, weil die förderfähigen Kosten beider Bescheide zusammengezählt werden. Im Zweifamilienhaus darf der Kredit über den Betrag einer Wohnung hinausgehen, weil der Höchstbetrag des ganzen Gebäudes zählt. Was eine Heizung insgesamt kostet, steht unter ${h.a('heizungstausch-kosten', 'Heizungstausch Kosten')}.</p>
<!--mini:zuschuss-->

<h2>Laufzeit, Zinsbindung, Tilgung</h2>
<p>Die KfW bietet zwei Formen an. Beim Annuitätendarlehen zahlen Sie in den tilgungsfreien Anlaufjahren nur Zinsen, danach gleich hohe Raten. Beim endfälligen Darlehen zahlen Sie während der Laufzeit nur Zinsen und am Ende den ganzen Betrag zurück.</p>
${h.table(['Laufzeit', 'Zinsbindung', 'tilgungsfreie Jahre'], [
  ['4 bis 5 Jahre', '5 Jahre', '1'],
  ['6 bis 10 Jahre', '10 Jahre', '1 bis 2'],
  ['11 bis 25 Jahre', '10 Jahre', '1 bis 3'],
  ['26 bis 35 Jahre', '10 Jahre', '1 bis 5'],
  ['endfällig, 4 bis 10 Jahre', 'ganze Laufzeit', 'ganze Laufzeit'],
], 'Annuitätendarlehen 358 und 359, Produktseite KfW', ['l', 'l', 'l'])}
<p>Nach der Kreditzusage bleiben zwölf Monate für den Abruf, verlängerbar auf höchstens 36 Monate; ab dem 13. Monat fällt eine Bereitstellungsprovision an. Vorzeitig zurückzahlen können Sie in der ersten Zinsbindung jederzeit ohne Vorfälligkeitsentschädigung, ab dem Mindestbetrag, den die Produktseite nennt. Das passt zum Zuschuss, der einige Monate nach dem Einbau eintrifft: Er geht direkt in die Sondertilgung, und die Laufzeit verkürzt sich.</p>

<h2>So läuft der Antrag</h2>
<p>Erst kommt die Zuschusszusage, wie unter ${h.a('foerderantrag', 'Heizungsförderung beantragen')} beschrieben. Dann gehen Sie mit der Zusage zu einer Bank oder Sparkasse, die KfW-Kredite vermittelt; die KfW nennt sie Finanzierungspartner. Eine neue Beratung durch den Fachbetrieb ist nicht nötig, der Nachweis des rechtzeitigen Vorhabenbeginns ergibt sich aus dem Zuschussantrag (${h.src('merkblatt358', 'Merkblatt 358/359')}). Sicherheiten vereinbaren Sie mit der Bank. Einen gemeinsamen Antrag mehrerer Personen oder eine Vollmacht für Dritte lässt die KfW beim Einfamilienhaus nicht zu.</p>
<p>Ein Punkt betrifft das Finanzamt. § 35c EStG schließt den Steuerbonus für Maßnahmen aus, für die zinsverbilligte Darlehen oder steuerfreie Zuschüsse genutzt werden. Für die Heizung, die schon den Zuschuss bekommt, ändert das nichts. Wer aber eine andere Maßnahme über den Kredit finanziert, sollte das beim ${h.a('steuerbonus-35c', 'Steuerbonus')} beachten. Für eine reine ${h.a('heizungsoptimierung', 'Heizungsoptimierung')} mit BAFA-Bescheid steht der Kredit ebenfalls offen. Die Gesamtübersicht der Heizungsförderung bietet ${h.a('kfw-458', 'KfW 458')}, den Zuschuss für Ihren Fall der ${h.a('waermepumpe-foerderung', 'Förderrechner')}.</p>`,
  },
  en: {
    slug: 'top-up-loan-heating',
    nav: 'Top-up loan',
    card: `The promotional loan that comes with the grant: up to ${EN.eur(K.hoechst_je_we)} per home, but only up to the eligible costs approved. 358 or 359, deadlines, repayment.`,
    title: 'KfW Top-Up Loan 2026: 358 and 359 for a New Heating System',
    description: `KfW top-up loan 2026: up to ${EN.eur(K.hoechst_je_we)} per home alongside the heating grant, extra interest discount up to ${EN.eur(K.zinsverbilligung_zve_bis)} income. How much it covers, when to apply.`,
    h1: 'KfW top-up loan: financing your share of a new heating system',
    intro: 'The grant arrives after installation, the installer’s bill before it. The top-up loan bridges that gap, though not for any amount and not at the same rate for everyone.',
    resume: `The KfW top-up loan (Ergänzungskredit) is a promotional loan for owners who already hold an approval for the KfW 458 heating grant or a BAFA notice for another single measure. It lends up to ${EN.eur(K.hoechst_je_we)} per home, but no more than the eligible costs in the approval and notice, including the part the grant will later cover. Owner-occupiers of a single-family house or a flat with household income of no more than ${EN.eur(K.zinsverbilligung_zve_bis)} receive an extra interest discount as loan 358; everyone else takes loan 359. You apply through a bank, not directly to KfW, within twelve months of the approval and before the grant is paid out. Example: a heat pump costs ${EN.eur(b.kosten)}, an oil boiler is replaced, income is ${EN.eur(b.zve)}. Eligible costs are ${EN.eur(heizung.foerderfaehig)}, the grant is ${EN.eur(heizung.zuschuss)}. The loan can pre-finance up to ${EN.eur(heizung.foerderfaehig)}; the remaining ${EN.eur(ueberHoechst)} above the cap needs other financing.`,
    faqs: [
      { q: 'How large can the top-up loan be for a heating system alone?', a: `As large as the eligible costs in the grant approval, so up to ${EN.eur(F.hoechst_erste_we[0].betrag)} for a single-family house applying by 31 January 2027. The ${EN.eur(K.hoechst_je_we)} per home limit only comes into play when other measures with a BAFA notice are added, such as insulation or windows. Costs above the grant cap are not covered by this loan.` },
      { q: 'What is the difference between loan 358 and loan 359?', a: `The interest discount. Loan 358, the “Plus” version, is for owners of a single-family house, or of a flat where the work concerns only their own unit, who live there as main residence and have household income of no more than ${EN.eur(K.zinsverbilligung_zve_bis)}. Their rate is reduced further during the first fixed-rate period. Everyone else, including landlords, owners of undivided apartment buildings and owners’ associations, uses loan 359.` },
      { q: 'When do I have to apply for the top-up loan?', a: 'Within twelve months of the KfW approval or the BAFA notice, and while the grant has not yet been paid. Installation may start after the grant approval, before the loan application. Once the loan is approved you have twelve months to draw it down; this can be extended to 36 months at most, but from the 13th month the bank charges a commitment fee.' },
      { q: 'Can I pay the loan down with the grant once it arrives?', a: 'Yes, that is what it is designed for. During the first fixed-rate period you can repay early at any time without a prepayment penalty, as long as the amount reaches KfW’s minimum. Passing the grant back to KfW through your bank shortens the term; on request the bank can lower the instalments instead. After the first fixed-rate period, early repayment is only possible in full and against a fee.' },
      { q: 'Does the bank ask for security for the top-up loan?', a: 'That is up to the bank. KfW only states that the type and amount of security are agreed with the lending bank. KfW publishes no fixed rule for this, so offers from different banks can differ. Ask before choosing a bank, because the application and the loan agreement run entirely through it.' },
    ],
    body: (h) => `
<h2>What the loan is for</h2>
<p>The heating grant is paid only once the system is running and the evidence has been checked. The installer wants paying sooner. The top-up loan therefore covers not just your own share but, if you wish, all of the eligible costs, up to ${h.pct(1)} of them. When the grant arrives, you use it as a special repayment. The loan is part of the same guideline as the grant (${h.src('begem2026', 'BEG EM guideline, no. 8.1')}) and may expressly be combined with it, even though only one form of funding is otherwise allowed for the same costs.</p>
<p>You need a KfW grant approval or a BAFA funding notice under the single-measures guideline in your name. It must be no more than twelve months old, and the grant must not yet have been paid. If you start building and only then find money is short, act in time.</p>

<h2>358 or 359: who gets which</h2>
${h.table(['Loan', 'For whom', 'Feature'], [
  ['358, top-up loan Plus', `owner-occupiers of a single-family house or of a flat where only their unit is worked on, main residence, household income up to ${h.eur(K.zinsverbilligung_zve_bis)}`, 'extra interest discount in the first fixed-rate period'],
  ['359, top-up loan', 'all other owners of single-family houses, landlords, owners of undivided apartment buildings', 'same terms, no extra discount'],
  ['359 for a WEG', 'owners’ association for work on common property', 'joint application by an authorised person'],
], 'KfW 358/359 product page, October 2026', ['l', 'l', 'l'])}
<p>For loan 358 the bank wants the same evidence KfW asks for with the income bonus: a land register extract, registration certificates of all relevant household members and their German income tax assessments for the second and third calendar year before the loan application. The ${h.eur(K.zinsverbilligung_zve_bis)} limit is well above the ${h.eur(F.einkommen_stufen[2].bis)} limit of the ${h.a('einkommensbonus', 'income bonus')}, so households who get no bonus can still get the discount. The guideline only sets a maximum gap below KfW’s refinancing cost (no. 8.5.2). The ${h.src('kfw358', 'KfW product page')} does not show actual rates at present.</p>

<h2>How much the loan really covers</h2>
<p>The loan amount is based on the eligible costs in the KfW approval and the BAFA notice combined. The ${h.eur(K.hoechst_je_we)} per home limit is generous, but it only bites when several measures are funded. For a new heating system alone, the grant’s cost cap limits the loan.</p>
${h.table(['Project', 'Cost', 'Eligible', 'Grant', 'Loan at most'], [
  ['Heat pump alone, oil boiler replaced, income €70,000', h.eur(b.kosten), h.eur(heizung.foerderfaehig), h.eur(heizung.zuschuss), h.eur(heizung.foerderfaehig)],
  ['the same heat pump plus roof insulation with a BAFA notice', `${h.eur(b.kosten)} plus roof`, h.eur(mitDach), 'KfW and BAFA', h.eur(Math.min(mitDach, K.hoechst_je_we))],
  ['smaller heat pump, income €38,000', h.eur(klein.foerderfaehig), h.eur(klein.foerderfaehig), h.eur(klein.zuschuss), h.eur(klein.foerderfaehig)],
  ['two-family house, owner lives in one unit, income €120,000', h.eur(50000), h.eur(zweiFamilie.foerderfaehig), h.eur(zweiFamilie.zuschuss), h.eur(zweiFamilie.foerderfaehig)],
], `Application in October 2026; BAFA cap for insulation ${h.eur(dach)} for the first home without a renovation roadmap`, ['l', 'r', 'r', 'r', 'r'])}
<p>In the first case ${h.eur(ueberHoechst)} of the bill is above the cap. Neither the grant nor the top-up loan covers that part; it has to come from savings or an ordinary loan. The calculator above shows the gap after the grant, while the eligible costs set how much of it the promotional loan may carry. With the roof insulation the possible loan rises to ${h.eur(Math.min(mitDach, K.hoechst_je_we))}, because the eligible costs of both notices are added together. In the two-family house the loan can exceed one home’s amount, because the cap of the whole building counts. Total replacement costs are covered under ${h.a('heizungstausch-kosten', 'heating replacement costs')}.</p>
<!--mini:zuschuss-->

<h2>Term, fixed rate, repayment</h2>
<p>KfW offers two forms. With an annuity loan you pay only interest during the repayment-free start years, then equal instalments. With a bullet loan you pay only interest throughout and repay the whole sum at the end.</p>
${h.table(['Term', 'Fixed rate', 'Repayment-free years'], [
  ['4 to 5 years', '5 years', '1'],
  ['6 to 10 years', '10 years', '1 to 2'],
  ['11 to 25 years', '10 years', '1 to 3'],
  ['26 to 35 years', '10 years', '1 to 5'],
  ['bullet loan, 4 to 10 years', 'whole term', 'whole term'],
], 'Annuity loans 358 and 359, KfW product page', ['l', 'l', 'l'])}
<p>After the loan approval you have twelve months to draw it down, extendable to 36 months at most; from the 13th month a commitment fee applies. During the first fixed-rate period you can repay early at any time without a penalty, from the minimum amount given on the product page. That suits a grant that arrives some months after installation: it goes straight into a special repayment, and the term shortens.</p>

<h2>How to apply</h2>
<p>First comes the grant approval, as described under ${h.a('foerderantrag', 'how to apply')}. You then take the approval to a bank or savings bank that arranges KfW loans, which KfW calls financing partners. No new consultation with the installer is needed; the grant application proves the project started on time (${h.src('merkblatt358', 'information sheet 358/359')}). Security is agreed with the bank. For a single-family house KfW accepts neither a joint application by several people nor a power of attorney for third parties, so even an owner living abroad deals with the bank in their own name.</p>
<p>One point concerns the tax office. Section 35c of the Income Tax Act rules out the tax credit for work financed with subsidised loans or tax-free grants. For a heating system that already gets the grant, that changes nothing. But if you finance another measure through the loan, keep it in mind for the ${h.a('steuerbonus-35c', 'tax credit')}. The loan is also open for ${h.a('heizungsoptimierung', 'heating optimisation')} with a BAFA notice. ${h.a('kfw-458', 'KfW 458')} gives the overview of the heating grant, and the ${h.a('waermepumpe-foerderung', 'grant calculator')} shows the amount for your case.</p>`,
  },
});
