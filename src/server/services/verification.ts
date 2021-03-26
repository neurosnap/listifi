import debug from 'debug';
import { v4 as uuid } from 'uuid';

import { verifyUrl } from '@app/routes';

import { env } from '../env';
import { EmailTemplates, sendEmail } from './mail';
import { db } from '../knex';
import { hashPass } from './pass';

const log = debug('server:mail');

export const createEmailVerification = async (email: string) => {
  // we don't want to save the uuid because only the email sent
  // to the user has access to the challenge code
  const challenge = uuid();
  const code = await hashPass(challenge);
  const [verification] = await db('email_verifications').insert(
    {
      email,
      code,
    },
    '*',
  );
  if (!verification) {
    return;
  }

  return { challenge, verification };
};

export const sendEmailVerification = async (email: string) => {
  const emailVerification = await createEmailVerification(email);
  if (!emailVerification) {
    log('could not create verification');
    return;
  }

  const vurl = verifyUrl(
    emailVerification.verification.id,
    emailVerification.challenge,
  );
  const url = `${env.apiUrl}${vurl}`;
  log(`verification url: ${url}`);
  try {
    const result = await sendEmail(EmailTemplates.registration, email, {
      verification_url: url,
    });
    log(result);
  } catch (err) {
    log(err);
  }
};
