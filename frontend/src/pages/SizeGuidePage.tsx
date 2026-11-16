import { ArrowLink } from '../components/ui/ArrowLink'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'

const TABLES: { title: string; columns: string[]; rows: string[][] }[] = [
  {
    title: 'Pantalones y chaquetas',
    columns: ['Talla', 'Cintura (cm)', 'Cadera (cm)', 'Pecho (cm)', 'Estatura (cm)'],
    rows: [
      ['S', '76 – 84', '92 – 100', '88 – 96', '164 – 170'],
      ['M', '84 – 92', '100 – 108', '96 – 104', '170 – 176'],
      ['L', '92 – 100', '108 – 116', '104 – 112', '176 – 182'],
      ['XL', '100 – 108', '116 – 124', '112 – 120', '182 – 188'],
      ['XXL', '108 – 116', '124 – 132', '120 – 128', '188 – 194'],
    ],
  },
  {
    title: 'Guantes',
    columns: ['Talla', 'Contorno de la mano (cm)', 'Largo de la mano (cm)'],
    rows: [
      ['S (8)', '20 – 22', '17,5 – 18,5'],
      ['M (9)', '22 – 24', '18,5 – 19,5'],
      ['L (10)', '24 – 26', '19,5 – 20,5'],
      ['XL (11)', '26 – 28', '20,5 – 21,5'],
    ],
  },
  {
    title: 'Calzado de seguridad',
    columns: ['Talla EU', 'Largo del pie (cm)'],
    rows: [
      ['39', '24,5'],
      ['40', '25,2'],
      ['41', '25,9'],
      ['42', '26,6'],
      ['43', '27,3'],
      ['44', '28,0'],
      ['45', '28,7'],
    ],
  },
]

/** "/guia-de-tallas": size tables for personal protective equipment. */
export function SizeGuidePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Equipos de protección', to: '/productos/equipos-de-proteccion' }, { label: 'Guía de tallas' }]} />
      <div className="container-page pb-20">
        <PageTitle className="mb-6 mt-6 px-2">Guía de tallas</PageTitle>
        <p className="max-w-3xl text-sm leading-relaxed">
          Mide sobre la ropa interior y sin apretar la cinta. Si estás entre dos tallas, elige la mayor: la ropa de
          protección debe permitir libertad de movimiento sin quedar holgada cerca de la cadena.
        </p>
        <div className="mt-10 space-y-12">
          {TABLES.map((table) => (
            <section key={table.title}>
              <h2 className="mb-4 font-display text-2xl font-extrabold uppercase">{table.title}</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] max-w-[920px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-ink text-left text-white">
                      {table.columns.map((c) => (
                        <th key={c} scope="col" className="px-4 py-3 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, i) => (
                      <tr key={row[0]} className={i % 2 === 0 ? 'bg-[#ececec]' : ''}>
                        {row.map((cell, j) => (
                          <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-bold' : ''}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
        <div className="mt-12">
          <ArrowLink to="/productos/equipos-de-proteccion" variant="button">
            Ver equipos de protección
          </ArrowLink>
        </div>
      </div>
    </>
  )
}
