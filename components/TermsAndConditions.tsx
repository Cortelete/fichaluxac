
import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
      <p>
        Bem-vinda à <strong>LuxAcademy</strong>! Ao se inscrever em nossos cursos, você concorda com os seguintes termos e condições, que visam garantir uma experiência segura, transparente e de alta qualidade para todas as partes.
      </p>

      <div className="space-y-4">
        <h4 className="font-bold text-lg text-gray-800">1. Inscrição e Pagamento</h4>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>A sua vaga no curso selecionado é confirmada apenas após a compensação do pagamento (seja integral ou da entrada, conforme a modalidade escolhida).</li>
          <li>As opções de parcelamento no cartão de crédito estão sujeitas à aprovação da operadora e podem incluir a cobrança de juros, que são de responsabilidade da mesma.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-lg text-gray-800">2. Política de Privacidade e Proteção de Dados (LGPD)</h4>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Coleta de Dados</strong>: Coletamos seus dados pessoais (nome, CPF, e-mail, telefone, data de nascimento) com a finalidade exclusiva de realizar sua matrícula, emitir seu certificado, e nos comunicarmos sobre o curso.</li>
          <li><strong>Consentimento</strong>: Ao aceitar estes termos, você consente com a coleta e o uso dos seus dados para os fins descritos acima.</li>
          <li><strong>Segurança e Confidencialidade</strong>: Comprometemo-nos a proteger seus dados. Eles não serão vendidos, alugados ou compartilhados com terceiros para fins de marketing.</li>
          <li><strong>Direitos do Titular</strong>: Você tem o direito de solicitar acesso, correção ou exclusão de seus dados a qualquer momento, entrando em contato conosco pelo e-mail luxury.joycialmeida@gmail.com.</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-bold text-lg text-gray-800">3. Consentimento para Menores de Idade</h4>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Alunas menores de 18 anos só podem se inscrever com a autorização explícita de um dos pais ou responsável legal.</li>
          <li>Ao preencher os dados do responsável e fornecer a assinatura digital, o responsável declara estar ciente e de acordo com a participação da menor no curso, assumindo a responsabilidade por todos os atos e obrigações decorrentes deste contrato.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-lg text-gray-800">4. Cancelamento e Reembolso</h4>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Conforme o Código de Defesa do Consumidor, você tem o direito de desistir do curso em até 7 (sete) dias corridos após a data da inscrição, com direito ao reembolso integral do valor pago.</li>
          <li>Após este período, a desistência implicará no reembolso de <strong>50% do valor pago</strong>. A retenção do valor restante destina-se a cobrir custos administrativos e de reserva de vaga. Se os materiais personalizados e exclusivos do curso já tiverem sido adquiridos no momento do cancelamento, o custo destes será descontado do valor a ser reembolsado.</li>
          <li>Após o início do curso, não haverá reembolso dos valores pagos.</li>
          <li>Todas as solicitações de cancelamento devem ser feitas por escrito para o e-mail luxury.joycialmeida@gmail.com.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-lg text-gray-800">5. Propriedade Intelectual</h4>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Todo o material didático fornecido (apostilas, vídeos, etc.) é de propriedade exclusiva da LuxAcademy by Joyci Almeida e protegido por leis de direitos autorais.</li>
          <li>É estritamente proibida a reprodução, cópia, distribuição ou venda do material a terceiros sem autorização prévia e por escrito.</li>
        </ul>
      </div>

      <p className="pt-4 border-t border-gray-200">
        Ao clicar em "Eu li e aceito os termos e condições", você confirma que leu, compreendeu e concorda com todas as cláusulas aqui apresentadas.
      </p>
    </div>
  );
};

export default TermsAndConditions;