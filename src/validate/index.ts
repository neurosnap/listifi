import emailValidator from 'email-validator';

export interface Validation {
  isValid: boolean;
  reason: string;
}

export const defaultValidation = (v: Partial<Validation> = {}): Validation => {
  return {
    isValid: true,
    reason: '',
    ...v,
  };
};

const alphanumericRe = new RegExp(/^[a-z0-9-]+$/i);

export function validUsername(name: string): Validation {
  if (name.startsWith('-')) {
    return {
      isValid: false,
      reason: 'username cannot start with a hyphen (-)',
    };
  }

  if (name.endsWith('-')) {
    return {
      isValid: false,
      reason: 'username cannot end with a hyphen (-)',
    };
  }

  if (!alphanumericRe.test(name)) {
    return {
      isValid: false,
      reason:
        'username can only contain alphanumeric characters or single hyphens',
    };
  }

  return {
    isValid: true,
    reason: '',
  };
}

export function validEmail(email: string): Validation {
  if (!emailValidator.validate(email)) {
    return {
      isValid: false,
      reason: 'not a valid email address',
    };
  }

  return {
    isValid: true,
    reason: '',
  };
}

export const NAME_CHAR_LIMIT = 60;
export function validListName(name: string): Validation {
  if (!name) {
    return {
      isValid: false,
      reason: 'Name cannot be empty',
    };
  }

  if (name.length > NAME_CHAR_LIMIT) {
    return {
      isValid: false,
      reason: `Name cannot exceed ${NAME_CHAR_LIMIT} characters`,
    };
  }

  return {
    isValid: true,
    reason: '',
  };
}

export const validPassword = (pass: string, curPass: string): Validation => {
  if (pass !== curPass) {
    return {
      isValid: false,
      reason: 'password confirmation does not match password entered',
    };
  }

  return {
    isValid: true,
    reason: '',
  };
};

const urlRe = new RegExp(/[^a-zA-Z0-9-]/g);
export function formatUrlName(name: string) {
  const stripped = name
    .toLocaleLowerCase()
    .replace(/ /g, '-')
    .replace(/_/g, '-')
    .replace(urlRe, '')
    .replace(/-+$/, '')
    .replace(/^-+/, '');

  const uri = encodeURIComponent(stripped);
  return uri;
}

const uuidRe = new RegExp(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
);
export function isUuid(uuid: string) {
  return uuidRe.test(uuid);
}
