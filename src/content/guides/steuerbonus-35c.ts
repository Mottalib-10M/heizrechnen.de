import { defineGuide } from '../../lib/guide-types';
import { foerderung, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Steuerbonus Heizung: § 35c EStG (7 %, 7 %, 6 %, höchstens 40.000 € je Objekt), § 52 Abs. 35a EStG (Abschluss vor 2030),
 * Kumulierungsverbot mit dem Zuschuss für dieselbe Maßnahme (§ 35c Abs. 3, Richtlinie BEG EM Nr. 8.6).
 * Vergleich Zuschuss gegen Steuerbonus mit dem Motor (Zuschuss) und den Sätzen aus P.steuer35c (Steuerbonus).
 */
const S = P.steuer35c;
const F = P.foerderung;
const heute = P.retrieved_at;
const H = hoechstbetrag(heute, 1);
const jahre = (k: number) => [Math.min(k * S.jahr1, S.max1), Math.min(k * S.jahr2, S.max2), Math.min(k * S.jahr3, S.max3)];
const steuer = (k: number) => Math.min(jahre(k).reduce((a, x) => a + x, 0), S.max_gesamt);
const satz35c = S.jahr1 + S.jahr2 + S.jahr3;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 30000, selbstnutzer: true, alt: 'gas', altJahre: 12, neu: 'wp', wpEU: true, zve: 90000, kind: false };
const faelle = [
  { k: 30000, z: 90000, alt: 'gas' as const, j: 12 },
  { k: 60000, z: 120000, alt: 'gas' as const, j: 12 },
  { k: 30000, z: 90000, alt: 'oel' as const, j: 30 },
  { k: 30000, z: 45000, alt: 'oel' as const, j: 30 },
].map((f) => ({ ...f, zuschuss: foerderung({ ...b, kosten: f.k, zve: f.z, alt: f.alt, altJahre: f.j }).zuschuss, steuer: steuer(f.k) }));
const [junggas, erdwaerme, oel90, oel45] = faelle;
const jahreErd = jahre(erdwaerme.k);
const grenzeOhneBonus = (F.grund * H) / satz35c;
const grenzeMitKgb = ((F.grund + F.kgb_stufen[0].satz) * H) / satz35c;
const maxAufwand = S.max_gesamt / satz35c;

export default defineGuide({
  id: 'steuerbonus-35c',
  group: 'foerderung',
  order: 112,
  mini: 'steuer35c',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'waermepumpe-foerderung', 'ergaenzungskredit', 'heizungsoptimierung', 'vermieter', 'einkommensbonus'],
  sources: ['estg35c', 'begem2026', 'merkblatt458', 'kfw458'],
  de: {
    slug: 'steuerbonus-heizung',
    nav: 'Steuerbonus Heizung',
    card: 'Steuerermäßigung nach § 35c EStG für den Heizungstausch: Sätze, Bedingungen, Frist bis Ende 2029 und wann sie den KfW-Zuschuss schlägt.',
    title: 'Steuerbonus Heizung 2026: § 35c EStG oder KfW-Zuschuss',
    description: `Steuerbonus Heizung 2026: ${DE.pct(S.jahr1)}, ${DE.pct(S.jahr2)} und ${DE.pct(S.jahr3)} der Kosten über drei Jahre, höchstens ${DE.eur(S.max_gesamt)}, nicht neben dem KfW-Zuschuss. Ab welchen Kosten er sich mehr lohnt.`,
    h1: 'Steuerbonus Heizung: § 35c EStG oder Zuschuss, was mehr bringt',
    intro: 'Für dieselbe neue Heizung gibt es entweder den Zuschuss der KfW oder die Steuerermäßigung, nie beides. Welcher Weg mehr bringt, hängt von Kosten, alter Heizung und Steuerlast ab.',
    resume: `Nach § 35c EStG mindert sich die Einkommensteuer für energetische Arbeiten am selbst bewohnten eigenen Haus, darunter die Erneuerung der Heizung: im Jahr des Abschlusses und im Folgejahr um je ${DE.pct(S.jahr1)} der Kosten, höchstens ${DE.eur(S.max1)}, im dritten Jahr um ${DE.pct(S.jahr3)}, höchstens ${DE.eur(S.max3)}. Je Objekt sind insgesamt ${DE.eur(S.max_gesamt)} möglich. Das Gebäude muss älter als ${S.objekt_mindestalter} Jahre sein, ein Fachbetrieb muss die Arbeit ausführen und bescheinigen, und die Maßnahme muss vor dem 1. Januar 2030 abgeschlossen sein. Für dieselbe Maßnahme schließt der Zuschuss der KfW den Steuerbonus aus. Über alle drei Jahre bringt der Bonus ${DE.pct(satz35c)} der Kosten, der Zuschuss mindestens ${DE.pct(F.grund)} von höchstens ${DE.eur(H)}. Beispiel: Eine Wärmepumpe zu ${DE.eur(junggas.k)} ersetzt eine zwölf Jahre alte Gasheizung, das Einkommen liegt bei ${DE.eur(junggas.z)}. Der Zuschuss beträgt ${DE.eur(junggas.zuschuss)}, der Steuerbonus ${DE.eur(junggas.steuer)}. Kostet die Anlage ${DE.eur(erdwaerme.k)}, kehrt sich das um: ${DE.eur(erdwaerme.steuer)} Steuerbonus gegen ${DE.eur(erdwaerme.zuschuss)} Zuschuss.`,
    faqs: [
      { q: 'Ab welchen Kosten bringt der Steuerbonus mehr als der Zuschuss?', a: `Ohne Bonus bei der Förderung ab rund ${DE.eur(grenzeOhneBonus)}: Dann sind ${DE.pct(satz35c)} Steuerbonus mehr als ${DE.pct(F.grund)} Zuschuss auf ${DE.eur(H)}. Wer Anspruch auf den Klimageschwindigkeitsbonus hat, braucht schon rund ${DE.eur(grenzeMitKgb)} Kosten, mit Einkommensbonus noch mehr. Voraussetzung ist immer, dass Sie in den drei Jahren genug Einkommensteuer zahlen, um den Bonus auszuschöpfen.` },
      { q: 'Wie viel Einkommensteuer muss ich zahlen, damit der Bonus wirkt?', a: `Mindestens so viel, wie der Bonus im jeweiligen Jahr beträgt. Er mindert die tarifliche Einkommensteuer nach Abzug anderer Ermäßigungen, eine Auszahlung darüber hinaus sieht das Gesetz nicht vor. Bei ${DE.eur(erdwaerme.k)} Kosten sind das ${DE.eur(jahreErd[0])} im ersten, ${DE.eur(jahreErd[1])} im zweiten und ${DE.eur(jahreErd[2])} im dritten Jahr. Wer in einem Jahr weniger Steuer zahlt, verliert den Rest dieses Jahres.` },
      { q: 'Kann ich Zuschuss und Steuerbonus für verschiedene Arbeiten am selben Haus nutzen?', a: 'Ja. Die Richtlinie erlaubt ausdrücklich, für einzelne Maßnahmen die Förderung zu nehmen, etwa für die neue Heizung, und für andere Maßnahmen die steuerliche Förderung, zum Beispiel für die Dämmung der Wände. Ausgeschlossen ist nur beides für dieselbe Maßnahme. Im Antrag bei der KfW bestätigen Sie, dass Sie für die geförderte Maßnahme keinen Steuerbonus beantragen.' },
      { q: 'Was passiert mit dem Steuerbonus, wenn ich das Haus im zweiten Jahr vermiete?', a: 'Dann entfällt er für dieses Jahr. Das Gesetz verlangt, dass Sie das Gebäude im jeweiligen Kalenderjahr ausschließlich zu eigenen Wohnzwecken nutzen. Die Ermäßigung verteilt sich auf drei Jahre, und jedes Jahr wird für sich geprüft. Wer nach dem Einbau ins Ausland zieht und vermietet, verliert also die noch ausstehenden Raten. Eine unentgeltliche Überlassung von Teilen der Wohnung an andere ist unschädlich.' },
      { q: 'Bis wann muss die neue Heizung fertig sein, um den Bonus zu bekommen?', a: `Die Maßnahme muss vor dem 1. Januar 2030 abgeschlossen sein, also spätestens am 31. Dezember 2029, und nach dem 31. Dezember 2019 begonnen worden sein. Maßgeblich ist der Abschluss, nicht die Zahlung. Wer im Dezember 2029 fertig wird, kann die drei Jahresraten trotzdem noch in den Steuererklärungen für 2029, 2030 und 2031 geltend machen. Nach dem heute geltenden Gesetzestext endet die Regel mit diesem Datum.` },
    ],
    body: (h) => `
<h2>Was § 35c EStG regelt</h2>
<p>Seit 2020 können Eigentümer energetische Arbeiten an ihrem selbst bewohnten Haus über die Steuererklärung fördern lassen (${h.src('estg35c', '§ 35c EStG')}). Begünstigt sind acht Maßnahmen, darunter die Erneuerung der Heizungsanlage und die Optimierung bestehender Heizungen, die älter als zwei Jahre sind. Die Ermäßigung wird nicht vom Einkommen abgezogen, sondern direkt von der Steuer. Sie verteilt sich auf drei Kalenderjahre: das Jahr, in dem die Maßnahme abgeschlossen wird, und die beiden folgenden.</p>
${h.table(['Jahr', 'Satz', 'höchstens'], [
  ['Jahr des Abschlusses', h.pct(S.jahr1), h.eur(S.max1)],
  ['folgendes Jahr', h.pct(S.jahr2), h.eur(S.max2)],
  ['drittes Jahr', h.pct(S.jahr3), h.eur(S.max3)],
  ['zusammen', h.pct(satz35c), h.eur(S.max_gesamt)],
], '§ 35c Absatz 1 EStG, je begünstigtes Objekt', ['l', 'r', 'r'])}
<p>Den Höchstbetrag erreicht man bei ${h.eur(maxAufwand)} Kosten. Er gilt je Objekt und für alle Maßnahmen zusammen, nicht je Maßnahme. Gehört das Haus mehreren Personen, gibt es ihn trotzdem nur einmal. Kosten für einen vom BAFA zugelassenen Energieberater, der die Arbeiten plant oder begleitet, mindern die Steuer sogar um ${h.pct(S.energieberater)}.</p>

<h2>Die Bedingungen</h2>
<p>Das Gebäude muss in der EU oder im Europäischen Wirtschaftsraum liegen, Ihnen gehören und von Ihnen in jedem der drei Jahre ausschließlich zu eigenen Wohnzwecken genutzt werden. Es muss bei Beginn der Arbeiten älter als ${S.objekt_mindestalter} Jahre sein, gerechnet ab dem Beginn der Herstellung. Ein Fachunternehmen muss die Arbeit ausführen und auf dem amtlich vorgeschriebenen Muster bescheinigen, dass die Mindestanforderungen eingehalten sind. Die Rechnung muss die Maßnahme, die Arbeitsleistung und die Adresse ausweisen, auf Deutsch ausgestellt sein, und bezahlt wird per Überweisung auf das Konto des Betriebs.</p>
<p>Ausgeschlossen ist der Bonus, wenn die Kosten schon als Werbungskosten, Betriebsausgaben, Sonderausgaben oder außergewöhnliche Belastungen berücksichtigt wurden, wenn die Steuerermäßigung für Handwerkerleistungen nach § 35a genutzt wird, und wenn für die Maßnahme zinsverbilligte Darlehen oder steuerfreie Zuschüsse fließen. Wer vermietet, kann § 35c nicht nutzen; für ihn bleibt die Grundförderung der KfW (${h.a('vermieter', 'Förderung für Vermieter')}).</p>

<h2>Zuschuss oder Steuerbonus: der Vergleich</h2>
<p>Der Zuschuss rechnet mit mindestens ${h.pct(F.grund)} auf höchstens ${h.eur(H)} förderfähige Kosten, dazu kommen für Selbstnutzer der Klimageschwindigkeitsbonus und der ${h.a('einkommensbonus', 'Einkommensbonus')}. Der Steuerbonus rechnet mit ${h.pct(satz35c)} auf die gesamten Kosten bis ${h.eur(maxAufwand)}. Deshalb gewinnt der Zuschuss bei normalen Kosten fast immer, der Steuerbonus nur bei teuren Anlagen und hohen Einkommen ohne Boni.</p>
${h.table(['Fall', 'Kosten', 'Zuschuss', 'Steuerbonus', 'besser'], [
  [`Gasheizung 12 Jahre, Einkommen ${h.eur(junggas.z)}`, h.eur(junggas.k), h.eur(junggas.zuschuss), h.eur(junggas.steuer), junggas.zuschuss >= junggas.steuer ? 'Zuschuss' : 'Steuer'],
  [`Erdwärmepumpe, Gasheizung 12 Jahre, Einkommen ${h.eur(erdwaerme.z)}`, h.eur(erdwaerme.k), h.eur(erdwaerme.zuschuss), h.eur(erdwaerme.steuer), erdwaerme.zuschuss >= erdwaerme.steuer ? 'Zuschuss' : 'Steuer'],
  [`Ölheizung, Einkommen ${h.eur(oel90.z)}`, h.eur(oel90.k), h.eur(oel90.zuschuss), h.eur(oel90.steuer), oel90.zuschuss >= oel90.steuer ? 'Zuschuss' : 'Steuer'],
  [`Ölheizung, Einkommen ${h.eur(oel45.z)}`, h.eur(oel45.k), h.eur(oel45.zuschuss), h.eur(oel45.steuer), oel45.zuschuss >= oel45.steuer ? 'Zuschuss' : 'Steuer'],
], 'Einfamilienhaus, selbst bewohnt, Antrag beziehungsweise Abschluss im Jahr 2026; Steuerbonus über drei Jahre', ['l', 'r', 'r', 'r', 'l'])}
<p>Ohne Boni liegt die Schwelle bei rund ${h.eur(grenzeOhneBonus)} Kosten, mit Klimabonus bei rund ${h.eur(grenzeMitKgb)}. Im zweiten Fall müssten Sie außerdem in jedem der drei Jahre genug Steuer zahlen: ${h.eur(jahreErd[0])}, ${h.eur(jahreErd[1])} und ${h.eur(jahreErd[2])}. Der Zuschuss kommt dagegen auf einmal, einige Monate nach dem Einbau, und hängt nicht von Ihrer Steuerlast ab. Den Zuschuss für Ihren Fall zeigt der ${h.a('waermepumpe-foerderung', 'Förderrechner')}.</p>
<!--mini:zuschuss-->

<h2>Beides am selben Haus</h2>
<p>Für dieselbe Maßnahme schließen sich die beiden Wege aus. Im Antrag bei der KfW verpflichten Sie sich, dafür keine steuerliche Förderung zu beantragen (${h.src('begem2026', 'Richtlinie BEG EM, Nr. 8.6')}). Für verschiedene Maßnahmen am selben Haus dürfen Sie sie aber kombinieren. Wer die Heizung mit dem Zuschuss tauscht und im selben Jahr die Fenster erneuert, kann für die Fenster den Steuerbonus nehmen. Das ${h.src('merkblatt458', 'Merkblatt 458')} wiederholt diese Regel. Vorsicht beim ${h.a('ergaenzungskredit', 'Ergänzungskredit')}: Finanziert er auch die Fenster, ist das ein zinsverbilligtes Darlehen für diese Maßnahme, und § 35c schließt den Bonus dann aus.</p>
<p>Für die Optimierung einer bestehenden Heizung gibt es neben § 35c auch den Zuschuss des BAFA von ${h.pct(P.bafa.optimierung)} (${h.a('heizungsoptimierung', 'Heizungsoptimierung')}). Hier sind beide Sätze niedriger, und der Steuerbonus ist mit ${h.pct(satz35c)} über drei Jahre meist der größere Betrag, wenn genug Steuer anfällt.</p>

<h2>Fristen und Ablauf</h2>
<p>Begünstigt sind Arbeiten, die nach dem 31. Dezember 2019 begonnen und vor dem 1. Januar 2030 abgeschlossen werden. Ein Antrag vorab ist nicht nötig, anders als bei der KfW. Sie machen den Bonus in der Steuererklärung für das Jahr des Abschlusses geltend, mit der Bescheinigung des Fachbetriebs, und wiederholen das in den beiden Folgejahren. Wer unsicher ist, ob der Zuschuss oder der Bonus mehr bringt, kann die Entscheidung bis zum Antrag bei der KfW offenhalten, denn der Zuschuss muss vor Beginn der Arbeiten beantragt werden, der Steuerbonus nicht. Das ganze Förderprogramm beschreibt ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
  en: {
    slug: 'tax-credit-heating-replacement',
    nav: 'Tax credit',
    card: 'The section 35c income tax reduction for replacing a heating system: rates, conditions, the end-2029 deadline and when it beats the KfW grant.',
    title: 'Tax Credit Heating 2026: Section 35c or the KfW Grant',
    description: `Tax credit for heating 2026: ${EN.pct(S.jahr1)}, ${EN.pct(S.jahr2)} and ${EN.pct(S.jahr3)} of costs over three years, at most ${EN.eur(S.max_gesamt)}, never alongside the KfW grant. From what cost it pays more than that.`,
    h1: 'Tax credit for a new heating system: section 35c or the grant?',
    intro: 'For the same new heating system you get either the KfW grant or the income tax reduction, never both. Which pays more depends on cost, the old system and your German tax bill.',
    resume: `Under section 35c of the German Income Tax Act, income tax is reduced for energy-saving work on a home you own and live in, including replacing the heating system: in the year the work is completed and the following year by ${EN.pct(S.jahr1)} of the cost each, capped at ${EN.eur(S.max1)}, and in the third year by ${EN.pct(S.jahr3)}, capped at ${EN.eur(S.max3)}. Each property can receive ${EN.eur(S.max_gesamt)} in total. The building must be more than ${S.objekt_mindestalter} years old, a registered firm must do and certify the work, and it must be completed before 1 January 2030. For the same work, the KfW grant rules the credit out. Over three years the credit is worth ${EN.pct(satz35c)} of the cost; the grant pays at least ${EN.pct(F.grund)} of up to ${EN.eur(H)}. Example: a ${EN.eur(junggas.k)} heat pump replaces a 12-year-old gas boiler, taxable income is ${EN.eur(junggas.z)}. The grant is ${EN.eur(junggas.zuschuss)}, the credit ${EN.eur(junggas.steuer)}. At a cost of ${EN.eur(erdwaerme.k)} it flips: ${EN.eur(erdwaerme.steuer)} credit against a ${EN.eur(erdwaerme.zuschuss)} grant.`,
    faqs: [
      { q: 'Above what cost does the tax credit beat the grant?', a: `With no grant bonus, from about ${EN.eur(grenzeOhneBonus)}: from there ${EN.pct(satz35c)} tax credit beats a ${EN.pct(F.grund)} grant on ${EN.eur(H)}. If you qualify for the climate speed bonus, you need about ${EN.eur(grenzeMitKgb)} of costs, and more again with the income bonus. Either way you must pay enough German income tax over the three years to use the credit in full.` },
      { q: 'How much German income tax do I need to pay for the credit to work?', a: `At least as much as the credit for each year. It reduces your assessed income tax after other reductions, and the law provides no payout beyond that. For ${EN.eur(erdwaerme.k)} of costs that is ${EN.eur(jahreErd[0])} in year one, ${EN.eur(jahreErd[1])} in year two and ${EN.eur(jahreErd[2])} in year three. If you owe less in a year, for example after a year with little German income, the rest of that year is lost.` },
      { q: 'Can I use the grant and the tax credit for different work on one house?', a: 'Yes. The guideline expressly allows the grant for some measures, such as a new heating system, and the tax credit for others, such as wall insulation. Only both for the same measure is excluded. In the KfW application you confirm that you will not claim the tax credit for the measure being funded.' },
      { q: 'What happens to the credit if I move abroad and let the house in year two?', a: 'You lose it for that year. The law requires the building to be used exclusively as your own home in each calendar year. The reduction is spread over three years and each year is tested on its own, so moving away and letting the house means losing the instalments still to come. Letting part of your home to others free of charge does not count against you.' },
      { q: 'By when must new heating be finished to qualify for the credit?', a: `The work must be completed before 1 January 2030, so by 31 December 2029 at the latest, and must have started after 31 December 2019. What counts is completion, not payment. If you finish in December 2029, you can still claim the three instalments in your returns for 2029, 2030 and 2031. Under the law as it stands today, the rule ends on that date.` },
    ],
    body: (h) => `
<h2>What section 35c says</h2>
<p>Since 2020, owners can claim energy-saving work on the home they live in through their tax return (${h.src('estg35c', 'section 35c Income Tax Act')}). Eight types of measure qualify, among them replacing the heating system and optimising an existing system more than two years old. The reduction is taken off the tax itself, not off income. It is spread over three calendar years: the year the work is finished and the two after.</p>
${h.table(['Year', 'Rate', 'At most'], [
  ['Year of completion', h.pct(S.jahr1), h.eur(S.max1)],
  ['Following year', h.pct(S.jahr2), h.eur(S.max2)],
  ['Third year', h.pct(S.jahr3), h.eur(S.max3)],
  ['Total', h.pct(satz35c), h.eur(S.max_gesamt)],
], 'Section 35c(1) Income Tax Act, per property', ['l', 'r', 'r'])}
<p>The maximum is reached at ${h.eur(maxAufwand)} of costs. It applies per property and to all measures together, not per measure. If several people own the house, it is still granted only once. Fees for an energy adviser approved by BAFA who plans or supervises the work even reduce the tax by ${h.pct(S.energieberater)}.</p>

<h2>The conditions</h2>
<p>The building must be in the EU or the European Economic Area, belong to you and be used exclusively as your own home in each of the three years. It must be more than ${S.objekt_mindestalter} years old when the work begins, counted from the start of construction. A registered firm must carry out the work and certify on the official form that the minimum requirements are met. The invoice must list the measure, the labour and the address, be issued in German, and be paid by transfer to the firm’s account.</p>
<p>The credit is excluded if the costs have already been deducted as work expenses, business expenses, special expenses or extraordinary burdens, if the tradesman credit under section 35a is used, and if subsidised loans or tax-free grants are taken for the measure. Landlords cannot use section 35c; for them the KfW basic grant remains (${h.a('vermieter', 'grants for landlords')}). The credit only reduces German income tax, so it is of no use if you are not taxed in Germany.</p>

<h2>Grant or tax credit: the comparison</h2>
<p>The grant pays at least ${h.pct(F.grund)} on eligible costs of up to ${h.eur(H)}, plus the climate speed bonus and the ${h.a('einkommensbonus', 'income bonus')} for owner-occupiers. The credit pays ${h.pct(satz35c)} on the full cost up to ${h.eur(maxAufwand)}. So the grant nearly always wins at normal costs, and the credit only for expensive systems and high incomes without bonuses.</p>
${h.table(['Case', 'Cost', 'Grant', 'Tax credit', 'Better'], [
  [`Gas boiler 12 years, income ${h.eur(junggas.z)}`, h.eur(junggas.k), h.eur(junggas.zuschuss), h.eur(junggas.steuer), junggas.zuschuss >= junggas.steuer ? 'grant' : 'credit'],
  [`Ground source heat pump, gas boiler 12 years, income ${h.eur(erdwaerme.z)}`, h.eur(erdwaerme.k), h.eur(erdwaerme.zuschuss), h.eur(erdwaerme.steuer), erdwaerme.zuschuss >= erdwaerme.steuer ? 'grant' : 'credit'],
  [`Oil boiler, income ${h.eur(oel90.z)}`, h.eur(oel90.k), h.eur(oel90.zuschuss), h.eur(oel90.steuer), oel90.zuschuss >= oel90.steuer ? 'grant' : 'credit'],
  [`Oil boiler, income ${h.eur(oel45.z)}`, h.eur(oel45.k), h.eur(oel45.zuschuss), h.eur(oel45.steuer), oel45.zuschuss >= oel45.steuer ? 'grant' : 'credit'],
], 'Single-family house, owner-occupied, application or completion in 2026; credit over three years', ['l', 'r', 'r', 'r', 'l'])}
<p>Without bonuses the threshold is about ${h.eur(grenzeOhneBonus)} of costs, with the climate bonus about ${h.eur(grenzeMitKgb)}. In the second case you would also need enough tax in each of the three years: ${h.eur(jahreErd[0])}, ${h.eur(jahreErd[1])} and ${h.eur(jahreErd[2])}. The grant, by contrast, arrives in one payment some months after installation and does not depend on your tax bill. The ${h.a('waermepumpe-foerderung', 'grant calculator')} shows the grant for your case.</p>
<!--mini:zuschuss-->

<h2>Both on the same house</h2>
<p>For the same measure the two routes exclude each other. In the KfW application you undertake not to claim tax relief for it (${h.src('begem2026', 'BEG EM guideline, no. 8.6')}). For different measures on the same house you may combine them. If you replace the heating with the grant and renew the windows in the same year, the windows can take the tax credit. ${h.src('merkblatt458', 'Information sheet 458')} repeats this rule. Take care with the ${h.a('ergaenzungskredit', 'top-up loan')}: if it also finances the windows, that is a subsidised loan for that measure, and section 35c then rules the credit out.</p>
<p>For optimising an existing system there is a BAFA grant of ${h.pct(P.bafa.optimierung)} alongside section 35c (${h.a('heizungsoptimierung', 'heating optimisation')}). Both rates are lower here, and the ${h.pct(satz35c)} credit over three years is usually the larger sum if you pay enough tax.</p>

<h2>Deadlines and process</h2>
<p>Work qualifies if it started after 31 December 2019 and is completed before 1 January 2030. Unlike the KfW grant, no prior application is needed. You claim the credit in your tax return for the year of completion, with the firm’s certificate, and again in the two following years. If you are unsure which route pays more, you can keep the choice open until the KfW application, because the grant must be applied for before work starts and the credit need not be. The whole grant programme is described under ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
});
