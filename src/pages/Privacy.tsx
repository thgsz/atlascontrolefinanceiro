import { Helmet } from 'react-helmet-async';
import { PublicLayout } from '@/components/atlas/PublicLayout';

export default function Privacy() {
  return (
    <PublicLayout>
      <Helmet>
        <title>Política de Privacidade — Atlas Controle Financeiro</title>
        <meta name="description" content="Saiba como o Atlas coleta, usa e protege seus dados pessoais no aplicativo de controle financeiro." />
        <link rel="canonical" href="https://atlascontrolefinanceiro.lovable.app/privacy" />
        <meta property="og:title" content="Política de Privacidade — Atlas Controle Financeiro" />
        <meta property="og:description" content="Saiba como o Atlas coleta, usa e protege seus dados pessoais no aplicativo de controle financeiro." />
        <meta property="og:url" content="https://atlascontrolefinanceiro.lovable.app/privacy" />
      </Helmet>
      <article className="prose-custom">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Política de Privacidade
        </h1>
        <p className="text-muted-foreground mb-10">Última atualização: 2026</p>

        <p className="text-foreground/80 mb-8 text-lg leading-relaxed">
          O Atlas – Controle Financeiro respeita sua privacidade e se compromete a proteger seus dados.
        </p>

        <Section title="1. Informações coletadas">
          <p>Coletamos apenas os dados necessários para funcionamento do aplicativo:</p>
          <ul>
            <li>Nome e email informados no cadastro</li>
            <li>Dados financeiros inseridos pelo próprio usuário</li>
            <li>Informações de uso do aplicativo (cookies e analytics)</li>
          </ul>
          <p>Não coletamos dados bancários reais, senhas de banco ou cartões.</p>
        </Section>

        <Section title="2. Como usamos seus dados">
          <p>Seus dados são usados apenas para:</p>
          <ul>
            <li>Permitir login e funcionamento do app</li>
            <li>Sincronizar informações entre dispositivos</li>
            <li>Melhorar o aplicativo</li>
            <li>Exibir anúncios relevantes (quando houver)</li>
          </ul>
        </Section>

        <Section title="3. Compartilhamento de dados">
          <p>Não vendemos nem compartilhamos seus dados pessoais.</p>
          <p>Podemos compartilhar apenas com serviços essenciais como:</p>
          <ul>
            <li>Servidores de banco de dados</li>
            <li>Serviços de hospedagem</li>
            <li>Plataformas de anúncios</li>
          </ul>
          <p>Sempre respeitando leis de privacidade.</p>
        </Section>

        <Section title="4. Segurança">
          <p>Usamos medidas de segurança para proteger suas informações. Mesmo assim, nenhum sistema é 100% seguro.</p>
        </Section>

        <Section title="5. Seus direitos">
          <p>Você pode:</p>
          <ul>
            <li>Editar seus dados</li>
            <li>Excluir sua conta</li>
            <li>Solicitar remoção de informações</li>
          </ul>
          <p>Basta entrar em contato.</p>
        </Section>

        <Section title="6. Cookies">
          <p>Usamos cookies apenas para melhorar a experiência e estatísticas.</p>
        </Section>

        <Section title="7. Alterações">
          <p>Esta política pode ser atualizada a qualquer momento.</p>
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
