import { PublicLayout } from '@/components/atlas/PublicLayout';

export default function Contact() {
  return (
    <PublicLayout>
      <article>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Contato
        </h1>
        <p className="text-foreground/80 mt-6 text-lg leading-relaxed mb-10">
          Se precisar de ajuda, sugestão ou quiser excluir sua conta, entre em contato:
        </p>

        <div className="atlas-glass p-8 rounded-2xl space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a href="mailto:atlascontrolefinanceiro@gmail.com" className="text-primary hover:underline font-medium">
                atlascontrolefinanceiro@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-sm text-muted-foreground">Tempo de resposta</p>
              <p className="text-foreground font-medium">Até 48 horas</p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-muted-foreground text-lg">
          Obrigado por usar o Atlas 💙
        </p>
      </article>
    </PublicLayout>
  );
}
