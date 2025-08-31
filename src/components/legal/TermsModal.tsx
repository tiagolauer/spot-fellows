import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Termos de Uso - I've Been Here</span>
          </DialogTitle>
          <DialogDescription>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">1. Aceitação dos Termos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar o aplicativo "I've Been Here", você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concorda com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">2. Descrição do Serviço</h3>
              <p className="text-muted-foreground leading-relaxed">
                O "I've Been Here" é uma plataforma digital que permite aos usuários fazer check-in em localizações específicas 
                e conectar-se com outras pessoas que estiveram nos mesmos lugares. O serviço utiliza geolocalização para 
                identificar a presença dos usuários em determinados locais.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">3. Cadastro e Conta do Usuário</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>3.1. Para usar nossos serviços, você deve criar uma conta fornecendo informações precisas e atualizadas.</p>
                <p>3.2. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.</p>
                <p>3.3. Você deve ter pelo menos 13 anos de idade para usar este serviço.</p>
                <p>3.4. É proibido criar múltiplas contas ou usar contas falsas.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">4. Uso Aceitável</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>Você concorda em NÃO usar o serviço para:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Assediar, ameaçar ou intimidar outros usuários</li>
                  <li>Compartilhar conteúdo ofensivo, discriminatório ou ilegal</li>
                  <li>Violar a privacidade de outros usuários</li>
                  <li>Tentar hackear ou comprometer a segurança do sistema</li>
                  <li>Usar o serviço para fins comerciais não autorizados</li>
                  <li>Fornecer informações falsas sobre sua localização</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">5. Privacidade e Dados Pessoais</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>5.1. Coletamos e processamos seus dados pessoais conforme descrito em nossa Política de Privacidade.</p>
                <p>5.2. Seus dados de localização são fundamentais para o funcionamento do serviço e serão tratados com máxima segurança.</p>
                <p>5.3. Você pode solicitar a exclusão de seus dados a qualquer momento através das configurações da conta.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">6. Funcionalidades Pagas</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>6.1. Alguns recursos do aplicativo podem requerer pagamento, como o desbloqueio de informações de contato.</p>
                <p>6.2. Todos os pagamentos são processados através de provedores seguros de pagamento.</p>
                <p>6.3. Não oferecemos reembolsos, exceto conforme exigido por lei.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">7. Propriedade Intelectual</h3>
              <p className="text-muted-foreground leading-relaxed">
                Todos os direitos autorais, marcas registradas e outros direitos de propriedade intelectual do aplicativo 
                pertencem ao "I've Been Here" e seus licenciadores. Você não pode copiar, modificar ou distribuir nosso conteúdo 
                sem autorização expressa.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">8. Responsabilidades e Limitações</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>8.1. O serviço é fornecido "como está" sem garantias de qualquer tipo.</p>
                <p>8.2. Não nos responsabilizamos por encontros ou interações entre usuários.</p>
                <p>8.3. Nossa responsabilidade é limitada ao máximo permitido por lei.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">9. Suspensão e Encerramento</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de suspender ou encerrar sua conta a qualquer momento, com ou sem aviso, 
                por violação destes termos ou por qualquer motivo que considerarmos apropriado.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">10. Alterações nos Termos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Podemos modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após 
                a publicação. O uso continuado do serviço após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">11. Lei Aplicável</h3>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais competentes 
                da jurisdição brasileira.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">12. Contato</h3>
              <p className="text-muted-foreground leading-relaxed">
                Para dúvidas sobre estes Termos de Uso, entre em contato conosco através do email: 
                <span className="text-primary"> legal@ivebeenhere.app</span>
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}