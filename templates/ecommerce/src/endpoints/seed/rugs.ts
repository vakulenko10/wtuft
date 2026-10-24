import fs from 'node:fs/promises'
import path from 'node:path'

import type { File, Payload } from 'payload'

type RugSeed = {
  alt: string
  description: string
  file: string
  mimetype: string
  priceInUSD: number
  slug: string
  title: string
}

const rugs: RugSeed[] = [
  {
    alt: 'Tufted portrait rug of a smiling face under a straw hat',
    description:
      'A hand-tufted portrait on a black ground. The pile is cut so the grin, the hat, and the red band stay sharp from across the room.',
    file: 'straw-hat.webp',
    mimetype: 'image/webp',
    priceInUSD: 48000,
    slug: 'straw-hat-portrait',
    title: 'Straw Hat Portrait',
  },
  {
    alt: 'Tufted botanical rug in sage and cream',
    description:
      'An oval botanical tuft in sage, cream, and deep green. The pile is dense enough to sit beside a sofa without losing the leaf shapes.',
    file: 'botanical.jpg',
    mimetype: 'image/jpeg',
    priceInUSD: 36000,
    slug: 'botanical-oval',
    title: 'Botanical Oval',
  },
  {
    alt: 'Tufted archway rug in forest green',
    description:
      'A narrow archway rug for a hallway or the foot of a bed. Two greens and a warm cream, finished with a tight bound edge.',
    file: 'arch.jpg',
    mimetype: 'image/jpeg',
    priceInUSD: 32000,
    slug: 'archway',
    title: 'Archway',
  },
  {
    alt: 'Tufted wave rug in teal and sand',
    description:
      'A low wave in teal and sand. Made as a single piece, with the lines carved into the pile so they read from standing height.',
    file: 'wave.jpg',
    mimetype: 'image/jpeg',
    priceInUSD: 29000,
    slug: 'tide-line',
    title: 'Tide Line',
  },
]

const text = (value: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  type: 'text',
  version: 1,
})

const paragraph = (value: string) => ({
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  type: 'paragraph',
  version: 1,
})

const richText = (paragraphs: string[]) => ({
  root: {
    children: paragraphs.map((value) => paragraph(value)),
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

const homeRichText = {
  root: {
    children: [
      {
        children: [text('Tufted rugs, made by hand')],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h1',
        type: 'heading',
        version: 1,
      },
      paragraph(
        'Wtuft is a small studio for tufted rugs. Each piece is drawn, tufted, and carved in-house, then finished so it can live on the floor.',
      ),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

async function fileFromPublic({ file, mimetype }: { file: string; mimetype: string }): Promise<File> {
  const filePath = path.resolve(process.cwd(), 'public', 'rugs', file)
  const data = await fs.readFile(filePath)

  return {
    data,
    mimetype,
    name: file,
    size: data.byteLength,
  }
}

export const seedRugs = async ({ payload }: { payload: Payload }): Promise<void> => {
  payload.logger.info('Seeding Wtuft rugs...')

  const demoProducts = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 20,
    overrideAccess: true,
    where: {
      slug: {
        in: ['hat', 'tshirt', ...rugs.map((rug) => rug.slug)],
      },
    },
  })

  const demoIDs = demoProducts.docs.map((doc) => doc.id)

  if (demoIDs.length) {
    await payload.delete({
      collection: 'variants',
      overrideAccess: true,
      where: {
        product: {
          in: demoIDs,
        },
      },
    })

    await payload.delete({
      collection: 'products',
      overrideAccess: true,
      where: {
        id: {
          in: demoIDs,
        },
      },
    })
  }

  const existingCarts = await payload.find({
    collection: 'carts',
    depth: 0,
    limit: 100,
    overrideAccess: true,
  })

  if (existingCarts.docs.length) {
    await payload.delete({
      collection: 'carts',
      overrideAccess: true,
      where: {
        id: {
          in: existingCarts.docs.map((cart) => cart.id),
        },
      },
    })
  }

  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      title: {
        equals: 'Rugs',
      },
    },
  })

  const category =
    categories.docs[0] ||
    (await payload.create({
      collection: 'categories',
      data: {
        slug: 'rugs',
        title: 'Rugs',
      },
      overrideAccess: true,
    }))

  const mediaDocs = []

  for (const rug of rugs) {
    const created = await payload.create({
      collection: 'media',
      data: {
        alt: rug.alt,
      },
      file: await fileFromPublic(rug),
      overrideAccess: true,
    })

    mediaDocs.push(created)
  }

  const productIDs: Array<number | string> = []

  for (const [index, rug] of rugs.entries()) {
    const image = mediaDocs[index]

    if (!image) continue

    const product = await payload.create({
      collection: 'products',
      data: {
        _status: 'published',
        categories: [category.id],
        description: richText([rug.description]),
        enableVariants: false,
        gallery: [{ image: image.id }],
        inventory: 8,
        layout: [],
        meta: {
          description: rug.description,
          image: image.id,
          title: `${rug.title} | Wtuft`,
        },
        priceInUSD: rug.priceInUSD,
        priceInUSDEnabled: true,
        slug: rug.slug,
        title: rug.title,
      },
      overrideAccess: true,
    })

    productIDs.push(product.id)
  }

  for (const id of productIDs) {
    await payload.update({
      id,
      collection: 'products',
      context: {
        disableRevalidate: true,
      },
      data: {
        relatedProducts: productIDs.filter((relatedID) => relatedID !== id),
      },
      overrideAccess: true,
    })
  }

  const home = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      slug: {
        equals: 'home',
      },
    },
  })

  const heroMedia = mediaDocs[1]?.id || mediaDocs[0]?.id
  const homeData = {
    _status: 'published' as const,
    hero: {
      links: [
        {
          link: {
            appearance: 'default' as const,
            label: 'Shop the collection',
            type: 'custom' as const,
            url: '/shop',
          },
        },
      ],
      media: heroMedia,
      richText: homeRichText,
      type: 'lowImpact' as const,
    },
    layout: [
      {
        blockName: 'Studio note',
        blockType: 'content',
        columns: [
          {
            richText: richText([
              'Every rug is tufted as a single piece. Sizes listed on each product are the finished size, and each one ships with a non-slip backing.',
            ]),
            size: 'full',
          },
        ],
      },
    ],
    meta: {
      description: 'Hand-tufted rugs from the Wtuft studio.',
      image: heroMedia,
      title: 'Wtuft',
    },
    title: 'Home',
  }

  if (home.docs[0]) {
    await payload.update({
      id: home.docs[0].id,
      collection: 'pages',
      context: {
        disableRevalidate: true,
      },
      data: homeData,
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'pages',
      context: {
        disableRevalidate: true,
      },
      data: {
        ...homeData,
        slug: 'home',
      },
      overrideAccess: true,
    })
  }

  await payload.updateGlobal({
    slug: 'header',
    context: {
      disableRevalidate: true,
    },
    data: {
      navItems: [
        {
          link: {
            label: 'Home',
            type: 'custom',
            url: '/',
          },
        },
        {
          link: {
            label: 'Shop',
            type: 'custom',
            url: '/shop',
          },
        },
        {
          link: {
            label: 'Account',
            type: 'custom',
            url: '/account',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'footer',
    context: {
      disableRevalidate: true,
    },
    data: {
      navItems: [
        {
          link: {
            label: 'Shop',
            type: 'custom',
            url: '/shop',
          },
        },
        {
          link: {
            label: 'Account',
            type: 'custom',
            url: '/account',
          },
        },
        {
          link: {
            label: 'Find my order',
            type: 'custom',
            url: '/find-order',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  payload.logger.info('Wtuft rugs seeded.')
}
