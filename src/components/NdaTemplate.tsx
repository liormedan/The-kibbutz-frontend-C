/**
 * --- NDA SWAP POINT ---------------------------------------------------------
 * Currently: renders a local HTML template (mockup).
 *
 * When the backend is ready:
 *   1. Receive pdfUrl from the service: const { pdfUrl } = await createNda(...)
 *   2. Replace this component's content with:
 *      <iframe src={pdfUrl} className="w-full h-[700px] rounded-xl border" />
 *   3. Remove NdaFormData and the template logic below.
 * ---------------------------------------------------------------------------
 */

export interface NdaFormData {
  entrepreneurName: string;
  participantName: string;
  projectName: string;
  date: string;
  confidentialityPeriod: string;
  intellectualProperty: string;
  responsibilities: string;
  contactEmail: string;
}

export default function NdaTemplate({ data }: { data: NdaFormData }) {
  return (
    <article
      className="bg-white p-6 text-gray-900 sm:p-10"
      dir="rtl"
      style={{ fontFamily: "'David CLM', David, serif", minHeight: "700px" }}
    >
      <div className="mb-10 text-center">
        <h1 className="mb-1 text-3xl font-bold">הסכם סודיות ואי-תחרות</h1>
        <p className="text-sm tracking-wide text-gray-500">Non-Disclosure & Non-Compete Agreement</p>
        <div className="mx-auto mt-4 h-0.5 w-24 bg-gray-400" />
      </div>

      <section className="mb-8">
        <p className="mb-4 text-sm">
          הסכם זה נערך ונחתם ביום <strong>{data.date}</strong>, בין הצדדים הבאים:
        </p>
        <div className="space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-5 text-sm">
          <p><strong>הצד המגלה (היזם):</strong> {data.entrepreneurName}</p>
          <p><strong>הצד המקבל (המשתתף):</strong> {data.participantName}</p>
          <p><strong>הפרויקט:</strong> {data.projectName}</p>
          <p><strong>אימייל ליצירת קשר:</strong> {data.contactEmail}</p>
        </div>
      </section>

      <Clause title="סעיף 1 - הגדרות">
        &quot;מידע סודי&quot; משמעו כל מידע טכני, עסקי, פיננסי, קניין רוחני, רעיונות,
        שיטות עבודה, תוכניות עסקיות ונתונים אחרים הקשורים לפרויקט{" "}
        <strong>{data.projectName}</strong>, המועברים בכל אמצעי.
      </Clause>

      <Clause title="סעיף 2 - התחייבויות הצד המקבל">{data.responsibilities}</Clause>
      <ul className="mb-6 list-disc space-y-2 pr-5 text-sm leading-7 text-gray-700">
        <li>לא לחשוף מידע סודי לצדדים שלישיים ללא הסכמה מפורשת בכתב מהיזם.</li>
        <li>לא להשתמש במידע הסודי למטרה שאינה קשורה ישירות לפרויקט.</li>
        <li>לנקוט אמצעי זהירות סבירים להגנה על המידע הסודי.</li>
        <li>להשיב או להשמיד את המידע הסודי על פי דרישת היזם.</li>
      </ul>

      <Clause title="סעיף 3 - קניין רוחני">{data.intellectualProperty}</Clause>
      <Clause title="סעיף 4 - תקופת ההסכם">
        הסכם זה יעמוד בתוקפו למשך <strong>{data.confidentialityPeriod}</strong> מיום
        החתימה עליו, אלא אם הופסק מוקדם יותר בהסכמה בכתב של שני הצדדים.
      </Clause>
      <Clause title="סעיף 5 - סעדים">
        הצדדים מסכימים כי הפרת הסכם זה עלולה לגרום נזק בלתי הפיך ליזם. בנוסף לכל
        סעד משפטי אחר, ליזם תעמוד הזכות לבקש צו מניעה מבית המשפט המוסמך.
      </Clause>
      <Clause title="סעיף 6 - הצהרת הצדדים">
        הצדדים מצהירים כי קראו הסכם זה, הבינו את תוכנו ומסכימים לתנאיו מרצונם החופשי.
      </Clause>

      <div className="mt-16 grid grid-cols-2 gap-12 border-t-2 border-gray-300 pt-8">
        <Signature name={data.entrepreneurName} role="היזם" date={data.date} />
        <Signature name={data.participantName} role="המשתתף" date="___________" />
      </div>

      <div className="mt-12 border-t border-gray-200 pt-6 text-center">
        <p className="text-[10px] text-gray-400">
          מסמך זה הופק באמצעות פלטפורמת הקיבוץ<br />
          לתוקף משפטי מלא מומלץ לפנות לייעוץ משפטי
        </p>
      </div>
    </article>
  );
}

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 border-b border-gray-200 pb-1 text-base font-bold">{title}</h2>
      <p className="text-sm leading-7 text-gray-700">{children}</p>
    </section>
  );
}

function Signature({ name, role, date }: { name: string; role: string; date: string }) {
  return (
    <div>
      <div className="mb-3 flex h-14 items-end border-b border-dashed border-gray-400 pb-1">
        <span className="text-xs italic text-gray-400">חתימה</span>
      </div>
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-xs text-gray-500">{role}</p>
      <p className="mt-1 text-xs text-gray-500">תאריך: {date}</p>
    </div>
  );
}
