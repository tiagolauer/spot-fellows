import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield } from "lucide-react"

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Política de Privacidade - I've Been Here</span>
          </DialogTitle>
          <DialogDescription>
            Em conformidade com a LGPD - Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">1. Introdução</h3>
              <p className="text-muted-foreground leading-relaxed">
                Esta Política de Privacidade descreve como o "I've Been Here" coleta, usa, armazena e protege suas 
                informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) 
                e demais regulamentações aplicáveis.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">2. Dados Pessoais Coletados</h3>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p><strong>2.1. Dados de Cadastro:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Nome e sobrenome</li>
                  <li>Endereço de email</li>
                  <li>Senha (criptografada)</li>
                  <li>Data de criação da conta</li>
                </ul>
                
                <p><strong>2.2. Dados de Localização:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Coordenadas GPS (latitude e longitude)</li>
                  <li>Endereços de check-in</li>
                  <li>Histórico de localizações visitadas</li>
                  <li>Timestamps de presença em locais</li>
                </ul>

                <p><strong>2.3. Dados de Uso:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Logs de acesso ao aplicativo</li>
                  <li>Interações com outros usuários</li>
                  <li>Preferências de configuração</li>
                  <li>Informações do dispositivo (modelo, SO, IP)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">3. Base Legal e Finalidades</h3>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p><strong>3.1. Execução de Contrato (Art. 7º, V da LGPD):</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Prestação dos serviços de geolocalização e conexão</li>
                  <li>Autenticação e segurança da conta</li>
                  <li>Processamento de pagamentos</li>
                </ul>

                <p><strong>3.2. Consentimento (Art. 7º, I da LGPD):</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Compartilhamento de dados de contato com outros usuários</li>
                  <li>Envio de notificações personalizadas</li>
                  <li>Marketing direto e comunicações promocionais</li>
                </ul>

                <p><strong>3.3. Legítimo Interesse (Art. 7º, IX da LGPD):</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Melhoria dos serviços e experiência do usuário</li>
                  <li>Detecção de fraudes e segurança</li>
                  <li>Análises estatísticas anonimizadas</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">4. Compartilhamento de Dados</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>4.1. <strong>Com outros usuários:</strong> Apenas informações que você escolher compartilhar através das funcionalidades do app.</p>
                <p>4.2. <strong>Prestadores de serviço:</strong> Provedores de hospedagem, pagamento e analytics, sob contratos de confidencialidade.</p>
                <p>4.3. <strong>Autoridades:</strong> Quando exigido por lei ou ordem judicial.</p>
                <p>4.4. <strong>Não vendemos seus dados</strong> para terceiros para fins comerciais.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">5. Armazenamento e Segurança</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>5.1. <strong>Localização:</strong> Dados armazenados em servidores seguros com criptografia.</p>
                <p>5.2. <strong>Prazo:</strong> Dados mantidos enquanto a conta estiver ativa ou conforme exigido por lei.</p>
                <p>5.3. <strong>Segurança:</strong> Implementamos medidas técnicas e administrativas para proteger seus dados.</p>
                <p>5.4. <strong>Backups:</strong> Realizamos backups regulares com a mesma proteção dos dados principais.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">6. Seus Direitos (LGPD)</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>Você tem direito a:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Acesso:</strong> Saber quais dados temos sobre você</li>
                  <li><strong>Correção:</strong> Atualizar dados incorretos ou incompletos</li>
                  <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados</li>
                  <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                  <li><strong>Oposição:</strong> Se opor ao tratamento de seus dados</li>
                  <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
                  <li><strong>Informação:</strong> Saber com quem compartilhamos seus dados</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">7. Cookies e Tecnologias Similares</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>7.1. Usamos cookies essenciais para o funcionamento do aplicativo.</p>
                <p>7.2. Cookies de analytics para melhorar nossos serviços (com seu consentimento).</p>
                <p>7.3. Você pode gerenciar cookies através das configurações do seu navegador.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">8. Menores de Idade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Não coletamos intencionalmente dados de menores de 13 anos. Entre 13 e 18 anos, 
                é necessário consentimento dos responsáveis legais. Se identificarmos dados de menores 
                coletados inadequadamente, serão excluídos imediatamente.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">9. Transferência Internacional</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados podem ser transferidos para países com nível adequado de proteção ou 
                mediante garantias apropriadas, sempre respeitando a LGPD e seus direitos.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">10. Alterações na Política</h3>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta política periodicamente. Mudanças significativas serão 
                comunicadas com 30 dias de antecedência através do app ou email.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">11. Encarregado de Proteção de Dados (DPO)</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p><strong>Contato do DPO:</strong> dpo@ivebeenhere.app</p>
                <p>Responsável por esclarecer dúvidas e receber solicitações sobre proteção de dados.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">12. Autoridade Nacional de Proteção de Dados (ANPD)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você tem o direito de apresentar reclamação à ANPD caso considere que seus 
                direitos não estão sendo respeitados. Site: <span className="text-primary">www.gov.br/anpd</span>
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-foreground">13. Contato</h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>Para exercer seus direitos ou esclarecer dúvidas:</p>
                <ul className="list-none space-y-1">
                  <li><strong>Email:</strong> <span className="text-primary">privacy@ivebeenhere.app</span></li>
                  <li><strong>DPO:</strong> <span className="text-primary">dpo@ivebeenhere.app</span></li>
                  <li><strong>Prazo de resposta:</strong> Até 15 dias úteis</li>
                </ul>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}