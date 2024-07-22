import { TextField } from '@mui/material';
import { UseFormRegister } from 'react-hook-form';
import { FormValuesType } from '@/app/types/form-value.type';

export function EmailField(props: {
    register: UseFormRegister<FormValuesType>;
    errorMessage?: string;
}) {

    return (
        <TextField
            label="メールアドレス"
            type='email'
            variant="standard"
            error={props.errorMessage !== undefined}
            helperText={props.errorMessage || ' '}
            {...props.register('email', {
                required: 'メールアドレスを入力してください',
                pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "無効なメールアドレスです",
                }
            })}
        />
    );
};

export function NameField(props: {
    register: UseFormRegister<FormValuesType>;
    errorMessage?: string;
}) {
    return(
        <TextField
            label="件名"
            variant="standard"
            helperText=' '
            error={props.errorMessage !== undefined}
            {...props.register('name', { required: '件名を入力してください' })}
        />
    )
};

export function PasswordField(props: {
    register: UseFormRegister<FormValuesType>;
    errorMessage?: string;
}) {
    return (
        <>
        <TextField
            multiline
            placeholder="Placeholder"
            label="password"
            variant="filled"
            error={props.errorMessage !== undefined}
            helperText={props.errorMessage || ' '}
            {...props.register('password', { required: 'パスワードを入力してください' })}
            style={{ height: 'auto' }}
            InputProps={{
                style: {
                    minHeight: '50px', // 必要に応じて高さを調整
                },
            }}
        />
        </>
    );
};