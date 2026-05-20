import { PublicLayout } from '@/components/atlas/PublicLayout';

export default function Terms() {
  return (
    <PublicLayout>
      <article>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Termos de Uso
        </h1>
        <p className="text-muted-foreground mb-10">Última atualização: 2026</p>

        <p className="text-foreground/80 mb-8 text-lg leading-relaxed">
          Ao usar o Atlas, você concorda com estes termos.
        </p>

        <Section title="1. Uso do aplicativo">
          <p>O Atlas é um aplicativo de organização financeira pessoal. Você é responsável pelos dados que inserir.</p>
        </Section>

        <Section title="2. Responsabilidade">
          <p>O Atlas não oferece aconselhamento financeiro profissional. Não nos responsabilizamos por decisões financeiras tomadas com base no app.</p>
        </Section>

        <Section title="3. Conta do usuário">
          <p>Você deve:</p>
          <ul>
            <li>Fornecer informações verdadeiras</li>
            <li>Manter sua senha segura</li>
          </ul>
          <p>Podemos suspender contas que violem os termos.</p>
        </Section>

        <Section title="4. Monetização">
          <p>O app pode exibir anúncios ou links afiliados para manter o serviço gratuito.</p>
        </Section>

        <Section title="5. Propriedade">
          <p>O design, marca e sistema do Atlas pertencem aos criadores do aplicativo. Não é permitido copiar ou revender o sistema.</p>
        </Section>

        <Section title="6. Encerramento">
          <p>Você pode excluir sua conta a qualquer momento.</p>
        </Section>

        <Section title="7. Mudanças">
          <p>Os termos podem ser atualizados sem aviso prévio.</p>
        </Section>

        <Section title="8. Contato">
          <p>Email: <a href="mailto:atlascontrolefinanceiro@gmail.com" className="text-primary hover:underline">atlascontrolefinanceiro@gmail.com</a></p>
        </Section>
      </article>
    </PublicLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
      <div className="space-y-3 text-foreground/70 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-foreground/70">
        {children}
      </div>
    </section>
  );
}
