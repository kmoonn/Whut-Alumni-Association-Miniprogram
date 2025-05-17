const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('config.js');

cloud.init();

let connection;

const createConnection = async () => {
    if (!connection) {
        connection = await mysql.createConnection(config.MYSQL);
    }
    return connection;
};

const handleError = (message, error) => {
    console.error(message, error);
    return { success: false, message: '服务器错误，请稍后重试' };
};

const validateParams = (params, requiredParams) => {
    for (let param of requiredParams) {
        if (!params[param]) {
            return { success: false, message: `${param}不能为空` };
        }
    }
    return { success: true };
};

// 用户登录
const login = async (event) => {
    const { username, password } = event;

    const validation = validateParams(event, ['username', 'password']);
    if (!validation.success) return validation;

    try {
        const conn = await createConnection();
        const [rows] = await conn.execute(
            'SELECT id, nickname, username, password, role, isInitialPassword FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return { success: false, message: '用户不存在' };
        }

        const user = rows[0];
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return { success: false, message: '密码错误' };
        }

        return {
            success: true,
            data: {
                id: user.id,
                nickname: user.nickname,
                username: user.username,
                role: user.role,
                isInitialPassword: user.isInitialPassword
            }
        };
    } catch (error) {
        return handleError('数据库查询错误:', error);
    }
};

// 用户注册
const register = async (event) => {
    const { username, password, nickname } = event;

    const validation = validateParams(event, ['nickname', 'username', 'password']);
    if (!validation.success) return validation;

    try {
        const conn = await createConnection();
        const [rows] = await conn.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length > 0) {
            return { success: false, message: '该用户名已被注册' };
        }

        const hashPassword = bcrypt.hashSync(password, 10);
        const [result] = await conn.execute(
            'INSERT INTO users (nickname, username, password) VALUES (?, ?, ?)',
            [nickname, username, hashPassword]
        );

        if (result.affectedRows === 1) {
            return { success: true, message: '注册成功' };
        } else {
            return { success: false, message: '注册失败，请稍后重试' };
        }
    } catch (error) {
        return handleError('数据库错误:', error);
    }
};

// 修改密码
const changePassword = async (event) => {
    const { userId, newPassword } = event;

    const validation = validateParams(event, ['userId', 'newPassword']);
    if (!validation.success) return validation;

    try {
        const conn = await createConnection();
        const hashPassword = bcrypt.hashSync(newPassword, 10);

        const [result] = await conn.execute(
            'UPDATE users SET password = ?, isInitialPassword = 0 WHERE id = ?',
            [hashPassword, userId]
        );

        if (result.affectedRows === 1) {
            return { success: true, message: '密码更新成功' };
        } else {
            return { success: false, message: '未找到该用户或更新失败' };
        }
    } catch (error) {
        return handleError('数据库更新失败:', error);
    }
};

exports.main = async (event) => {
    switch (event.action) {
        case 'login':
            return await login(event);
        case 'register':
            return await register(event);
        case 'updatePwd':
            return await changePassword(event);
        default:
            return { success: false, message: '无效的操作' };
    }
};
