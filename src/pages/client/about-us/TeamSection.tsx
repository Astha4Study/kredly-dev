import { GithubIcon } from '@/components/GithubIcon';
import GridBorder from '@/components/GridBorder';
import { ArrowUpRight, Mail } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import firmanImage from '@/assets/images/firman.jpg';
import fauzanImage from '@/assets/images/fauzan.jpg';
import iyanImage from '@/assets/images/iyan.jpg';

const TeamMembers = [
  {
    name: 'Firman Zamzami',
    role: 'AI Engineer',
    expertise: 'Artificial Intelligence',
    image: firmanImage,
    linkedin: '#',
    github: '#',
    email: 'firman@kredly.com',
  },
  {
    name: 'Akhmad Fauzan',
    role: 'Fullstack & Blockchain Developer',
    expertise: 'Blockchain',
    image: fauzanImage,
    linkedin: '#',
    github: '#',
    email: 'fauzan@kredly.com',
  },
  {
    name: 'Agus Priyanto',
    role: 'Frontend Developer',
    expertise: 'Frontend Engineering',
    image: iyanImage,
    linkedin: '#',
    github: '#',
    email: 'agus@kredly.com',
  },
];

export default function TeamSection() {
  return (
    <section className="px-4 pt-4 sm:px-6 ">
      <GridBorder
        className="mx-auto w-full max-w-7xl"
        paddingY="py-16 sm:py-24"
      >
        {/* Header */}
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-6xl flex-col items-center text-center"
          >
            <Badge variant="default">Tim Kami</Badge>

            <div className="mt-4 max-w-3xl space-y-4 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Orang-orang di balik{' '}
                <span className="text-primary">Kredly</span>
              </h2>

              <p className="mx-auto max-w-2xl text-muted-foreground">
                Kami membangun masa depan verifikasi kemampuan yang lebih
                transparan, terpercaya, dan dapat diverifikasi secara global.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Team Grid */}
        <div className="mt-12 w-full grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TeamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="
              group
              relative
              overflow-hidden
              border
              border-zinc-200
              bg-white
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-primary/30
              hover:shadow-lg
            "
            >
              {/* Image */}
              <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                <img
                  src={member.image}
                  alt={member.name}
                  width={400}
                  height={300}
                  className="
                  h-full
                  w-full
                  aspect-[4/3]
                  object-cover
                  grayscale
                  transition-all
                  duration-500
                  group-hover:scale-105
                  group-hover:grayscale-0 
                "
                />
                {/* Expertise Badge */}
                <div className="absolute right-3 top-3">
                  <Badge>{member.expertise}</Badge>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-4">
                {/* Large Number */}
                <div className="absolute right-5 bottom-5 text-5xl font-semibold text-zinc-100 transition-all duration-300 group-hover:text-primary/10">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Name */}
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {member.name}
                </h3>

                {/* Role */}
                <p
                  className="
                  mt-1
                  text-sm
                  font-medium
                  text-primary
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
                >
                  {member.role}
                </p>

                {/* Divider */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="h-px w-12 bg-zinc-200 transition-all duration-300 group-hover:w-20 group-hover:bg-primary/40" />

                  <ArrowUpRight
                    className="
                      size-4
                      text-muted-foreground
                      opacity-0
                      transition-all
                      duration-300
                      group-hover:opacity-100
                      group-hover:text-primary
                    "
                  />
                </div>

                {/* Social */}
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={member.linkedin}
                    aria-label="LinkedIn"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      border
                      border-zinc-200
                      text-muted-foreground
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-primary/30
                      hover:bg-primary/5
                      hover:text-primary
                    "
                  >
                    <FaLinkedin className="size-4" />
                  </a>

                  <a
                    href={member.github}
                    aria-label="GitHub"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      border
                      border-zinc-200
                      text-muted-foreground
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-primary/30
                      hover:bg-primary/5
                      hover:text-primary
                    "
                  >
                    <GithubIcon className="size-4" />
                  </a>

                  <a
                    href={`mailto:${member.email}`}
                    aria-label="Email"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      border
                      border-zinc-200
                      text-muted-foreground
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-primary/30
                      hover:bg-primary/5
                      hover:text-primary
                    "
                  >
                    <Mail className="size-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GridBorder>
    </section>
  );
}
