import React from 'react';
import { FormData } from '../types';
import { COURSE_OPTIONS } from '../constants';
import TermsAndConditions from './TermsAndConditions';

interface ContractDocumentProps {
    id: string;
    formData: FormData;
}

const ContractDocument: React.FC<ContractDocumentProps> = ({ id, formData }) => {
    const { name, cpf, rg, address, isMinor, parentName, parentCpf, parentRg, course, signatureConfirmation } = formData;
    const courseLabel = COURSE_OPTIONS.find(c => c.value === course)?.label || course;

    return (
        <div id={id} className="bg-white text-black p-12" style={{ width: '210mm', fontFamily: 'Times New Roman, serif' }}>
            <div className="text-center mb-10">
                <h1 className="text-2xl font-bold">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h1>
                <h2 className="text-xl font-semibold">LuxAcademy by Joyci Almeida</h2>
            </div>

            <div className="mb-8 text-sm">
                <h3 className="text-lg font-bold mb-3 underline">PARTES CONTRATANTES</h3>
                <p className="mb-2">
                    <strong>CONTRATADA:</strong> Luxury Studio de Beleza Joyci Almeida, pessoa jurídica de direito privado, com sede na Rua Teixeira Mendes, 700, Uvaranas, Ponta Grossa - PR, doravante denominada simplesmente <strong>CONTRATADA</strong>.
                </p>
                <p>
                    <strong>CONTRATANTE:</strong> {name}, portador(a) do CPF nº {cpf} e do RG nº {rg}, residente e domiciliado(a) no endereço: {address}.
                </p>
                {isMinor && (
                     <p className="mt-2">
                        <strong>REPRESENTADO(A) POR SEU RESPONSÁVEL LEGAL:</strong> {parentName}, portador(a) do CPF nº {parentCpf} e do RG nº {parentRg}, que assina o presente instrumento.
                     </p>
                )}
            </div>

            <div className="mb-8 text-sm">
                <h3 className="text-lg font-bold mb-3 underline">CLÁUSULA PRIMEIRA - DO OBJETO</h3>
                <p>
                    O presente contrato tem por objeto a prestação de serviços educacionais pela CONTRATADA à CONTRATANTE, referente ao curso <strong>"{courseLabel}"</strong>, compreendendo o material didático e as aulas teóricas e práticas conforme o cronograma do curso.
                </p>
            </div>

            <div className="mb-8 text-sm">
                 <h3 className="text-lg font-bold mb-3 underline">CLÁUSULA SEGUNDA - DOS TERMOS E CONDIÇÕES</h3>
                <p>A CONTRATANTE declara ter lido, compreendido e concordado com todos os Termos e Condições apresentados durante o processo de inscrição, os quais passam a fazer parte integrante deste contrato para todos os fins de direito. As cláusulas abaixo reproduzem os referidos termos:</p>
            </div>
            
            <div className="border p-4 bg-gray-50 text-xs">
                <TermsAndConditions />
            </div>

            <div className="mt-12 text-center text-sm">
                <p className="mb-8">E, por estarem assim justas e contratadas, as partes assinam o presente instrumento.</p>
                <p className="mb-2">Ponta Grossa, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
                
                <div className="mt-16 inline-block">
                    <p className="font-serif text-lg border-t border-black pt-2 px-8">{isMinor ? parentName : name}</p>
                    <p className="text-xs">({isMinor ? "Assinatura do Responsável Legal" : "Assinatura do(a) Aluno(a)"})</p>
                    <p className="text-xs">CPF: {isMinor ? parentCpf : cpf}</p>
                </div>

                <div className="mt-10 text-xs text-gray-600">
                    <p>Assinatura digital confirmada pela digitação da frase:</p>
                    <p>"{signatureConfirmation}"</p>
                </div>
            </div>
        </div>
    );
};

export default ContractDocument;
