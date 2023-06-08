<template>
    <a @click="handleAvatarClick">
        <a-avatar :style="avatarStyle">
            <template #icon>
                <UserOutlined />
            </template>
        </a-avatar>
    </a>

    <a-modal v-model:visible="loginModalVisible" title="Login" okText="Submit" @ok="handleSubmit" @cancel="handleCancel"
        width="450px">
        <a-form :model="formState" name="login-form" class="login-form" ref="formRef">
            <a-form-item label="Username" name="username" :rules="loginUsernameRules" has-feedback>
                <a-input v-model:value="formState.username">
                    <template #prefix>
                        <UserOutlined />
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item label="Password" name="password" :rules="loginPasswordRules" has-feedback>
                <a-input-password v-model:value="formState.password">
                    <template #prefix>
                        <LockOutlined />
                    </template>
                </a-input-password>
            </a-form-item>

            <a-form-item>
                <a-space :size="200">
                    <a @click="handleForgotPassword">Forgot password</a>
                    <a @click="regModalVisible = true">Register now</a>
                </a-space>
            </a-form-item>
        </a-form>
    </a-modal>

    <a-modal v-model:visible="regModalVisible" title="Register" okText="Submit" @ok="handleRegSubmit"
        @cancel="handleRegCancel" width="450px">
        <a-form :model="regFormState" name="register-form" class="register-form" ref="regFormRef">
            <a-form-item label="Username" name="username" :rules="regUsernameRules" has-feedback>
                <a-input v-model:value="regFormState.username">
                    <template #prefix>
                        <UserOutlined />
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item label="Password" name="password" has-feedback type="password" :rules="regPasswordRules">
                <a-input-password v-model:value="regFormState.password">
                    <template #prefix>
                        <LockOutlined />
                    </template>
                </a-input-password>
            </a-form-item>

            <a-form-item label="Confirm password" name="confirm" has-feedback type="password" :rules="regConfirmRules">
                <a-input-password v-model:value="regFormState.confirm">
                    <template #prefix>
                        <LockOutlined />
                    </template>
                </a-input-password>
            </a-form-item>

            <a-form-item label="Mail" name="mail" has-feedback type="mail" :rules="regMailRules">
                <a-input v-model:value="regFormState.mail">
                    <template #prefix>
                        <MailOutlined />
                    </template>
                </a-input>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from 'vue';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
} from '@ant-design/icons-vue';
import { FormInstance } from 'ant-design-vue';

interface FormState {
    username: string;
    password: string;
}

interface RegFormState {
    username: string;
    password: string;
    confirm: string;
    mail: string;
}

export default defineComponent({
    components: {
        UserOutlined,
        LockOutlined,
        MailOutlined,
    },
    setup() {
        const formRef = ref<FormInstance>();
        const formState = reactive<FormState>({
            username: '',
            password: '',
        });

        const loginModalVisible = ref(false);

        const checkLogin = () => {
            return localStorage.getItem('isLogin') === 'true';
        };
        const isLogin = ref(checkLogin());

        const handleSubmit = () => {
            formRef.value?.validateFields().then(values => {
                localStorage.setItem('username', values.username);
                localStorage.setItem('isLogin', 'true');
                isLogin.value = checkLogin();
                formRef.value?.resetFields();
                loginModalVisible.value = false;
            });
        };

        const handleCancel = () => {
            formRef.value?.resetFields();
            loginModalVisible.value = false;
        };

        const handleAvatarClick = () => {
            if (isLogin.value) {
                localStorage.removeItem('isLogin');
                isLogin.value = checkLogin();
            } else {
                loginModalVisible.value = true;
            }
        };

        const avatarStyle = computed(() => {
            return {
                backgroundColor: isLogin.value ? '#87d068' : '#7a7c79',
            };
        });

        const regFormRef = ref<FormInstance>();
        const regFormState = reactive<RegFormState>({
            username: '',
            password: '',
            confirm: '',
            mail: '',
        });

        const regModalVisible = ref(false);

        const handleRegSubmit = () => {
            console.log(regFormState);
            regFormRef.value?.validateFields().then(values => {
                regFormRef.value?.resetFields();
                regModalVisible.value = false;
                loginModalVisible.value = true;
            });
        };

        const handleRegCancel = () => {
            regFormRef.value?.resetFields();
            regModalVisible.value = false;
        };

        const handleForgotPassword = () => {};

        const loginUsernameValidator = (rule: any, value: string, callback: any) => {

            if (!value || value === '') {
                callback(new Error('Please input your username!'));
                return;
            }

            // TODO: 后端验证username是否存在

            let isExist = value === 'admin';

            if (!isExist) {
                callback(new Error('username not exist'));
            } else {
                callback();
            }
        };
        const loginUsernameRules = [
            { required: true, validator: loginUsernameValidator, trigger: ['blur', 'submit'] },
        ];

        const loginPasswordValidator = (rule: any, value: string, callback: any) => {

            if (!value || value === '') {
                callback(new Error('Please input your password!'));
                return;
            }

            // TODO: 后端验证password是否正确

            let isCorrect = value === '123456';

            if (!isCorrect) {
                callback(new Error('password error'));
            } else {
                callback();
            }
        }
        const loginPasswordRules = [
            { required: true, validator: loginPasswordValidator, trigger: 'submit' },
        ];

        const regUsernameValidator = (rule: any, value: string, callback: any) => {

            if (!value || value === '') {
                callback(new Error('Please input your username!'));
                return;
            }

            if (value.length < 4) {
                callback(new Error('username length must greater than 4'));
                return;
            }

            if (value.length > 16) {
                callback(new Error('username length must less than 16'));
                return;
            }

            // TODO: 后端验证username是否存在

            let isExist = value === 'admin';

            if (isExist) {
                callback(new Error('username already exist'));
            } else {
                callback();
            }
        }
        const regUsernameRules = [
            { required: true, validator: regUsernameValidator, trigger: ['blur', 'submit'] },
        ];

        const regPasswordValidator = (rule: any, value: string, callback: any) => {

            if (!value || value === '') {
                callback(new Error('Please input your password!'));
                return;
            }

            if (value.length < 6) {
                callback(new Error('password length must greater than 6'));
                return;
            }

            if (value.length > 16) {
                callback(new Error('password length must less than 16'));
                return;
            }

            callback();
        }
        const regPasswordRules = [
            { required: true, validator: regPasswordValidator, trigger: 'change' },
        ];

        const regConfirmValidator = (rule: any, value: string, callback: any) => {

            if (!value || value === '') {
                callback(new Error('Please confirm your password!'));
                return;
            }

            if (value !== regFormState.password) {
                callback(new Error('password not match'));
            } else {
                callback();
            }
        }
        const regConfirmRules = [
            { required: true, validator: regConfirmValidator, trigger: 'change' },
        ];

        const regMailValidator = (rule: any, value: string, callback: any) => {

            if (!value || value === '') {
                callback(new Error('Please input your mail!'));
                return;
            }

            let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if (!reg.test(value)) {
                callback(new Error('mail format error'));
                return;
            }

            // TODO: 后端验证mail是否存在

            let isExist = value === '123456@admin.com';

            if (isExist) {
                callback(new Error('mail already exist'));
                return;
            }

            callback();
        }
        const regMailRules = [
            { required: true, validator: regMailValidator, trigger: ['blur', 'submit'] },
        ];

        return {
            formRef,
            formState,
            loginModalVisible,

            handleSubmit,
            handleCancel,
            handleForgotPassword,
            handleAvatarClick,

            isLogin,
            avatarStyle,

            regFormRef,
            regFormState,
            regModalVisible,

            handleRegSubmit,
            handleRegCancel,

            loginUsernameRules,
            loginPasswordRules,
            regUsernameRules,
            regPasswordRules,
            regConfirmRules,
            regMailRules,
        };
    },
});
</script>