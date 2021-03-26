import debug from 'debug';
import sendgrid from '@sendgrid/mail';
import { env } from '../env';

const log = debug('server:mail');

sendgrid.setApiKey(env.sendGridApiKey);

export enum EmailTemplates {
  registration = 'd-8a64a3e5423c489492e65e773c297221',
  suggestionRequest = 'd-f6ca8d4a06ef4204b24571f0434e49c4',
  suggestionApproved = 'd-892e971c37f94cdc91cf5ad6ba8720ca',
  comment = 'd-44b5b35c0f1c48c89a466521568a0076',
}

export const sendEmail = async (
  templateId: EmailTemplates,
  to: string,
  data: { [key: string]: string },
) => {
  log(`sending email to ${to}`);
  const res = await sendgrid.send({
    templateId,
    from: 'support@listifi.app',
    to,
    dynamicTemplateData: data,
    asm: {
      groupId: 93059,
      groupsToDisplay: [93059],
    },
  });
  return res;
};
