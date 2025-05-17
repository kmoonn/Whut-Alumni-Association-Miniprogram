const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');
const config = require('config.js');

cloud.init();

let connection;

// 创建数据库连接
const createConnection = async () => {
    if (!connection) {
        connection = await mysql.createConnection(config.MYSQL);
    }
    return connection;
};

// 关闭数据库连接
const closeConnection = async () => {
    if (connection) {
        await connection.end();
        connection = null;
    }
};

// 统一错误处理函数
const handleError = (message, error) => {
    console.error(message, error);
    return { code: 500, message: '服务器错误，请稍后重试', error: error.message };
};


// 重点校友推荐
const applyAlumni = async (event) => {
    const { category, name, region, company, position, graduation_year, department, major, phone, deeds, userId } = event;

    try {
        const conn = await createConnection();

        // 插入主表数据
        const sql = `
            INSERT INTO applied_alumni (
                category, name, region, company, position,
                graduation_year, department, major, phone, deeds
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            category.join(','), name, region || null, company || null, position || null,
            graduation_year || null, department || null, major || null, phone || null, deeds || null
        ];

        const [result] = await conn.execute(sql, values);

        // 插入关联记录
        await conn.execute(
            `INSERT INTO apply_note(user_id, alum_id) VALUES (?, ?)`,
            [userId, result.insertId]
        );

        return { code: 200, message: '提交成功', data: { id: result.insertId } };
    } catch (error) {
        return handleError('提交失败', error);
    } finally {
        await closeConnection();
    }
};

// 获取疑似校友信息
const getPendingMatches = async (event) => {
    const { reviewerId, departments } = event;

    if (!Array.isArray(departments) || departments.length < 2) {
        return { code: 400, message: '请至少选择两个学院进行审核' };
    }

    // 构建 WHERE 条件和参数
    const buildDepartmentCondition = (departments, reviewerId) => {
        const OTHER_LABEL = '其他';
        const hasOther = departments.includes(OTHER_LABEL);
        const realDepartments = departments.filter(d => d !== OTHER_LABEL);

        let whereClause = `p.status = '待确认' AND (`;
        const conditions = [];
        const queryParams = [];

        if (realDepartments.length > 0) {
            conditions.push(`p.department IN (${realDepartments.map(() => '?').join(',')})`);
            queryParams.push(...realDepartments);
        }

        if (hasOther) {
            conditions.push(`p.department IS NULL`);
        }

        whereClause += conditions.join(' OR ') + `)
            AND NOT EXISTS (
                SELECT 1 FROM review_note r 
                WHERE r.alum_id = p.id AND r.user_id = ?
            )`;

        queryParams.push(reviewerId);

        return { whereClause, queryParams };
    };

    try {
        const conn = await createConnection();
        const { whereClause, queryParams } = buildDepartmentCondition(departments, reviewerId);

        // 获取待审核总数
        const [countRows] = await conn.execute(
            `SELECT COUNT(*) as total 
             FROM pending_alumni p
             WHERE ${whereClause}`,
            queryParams
        );

        // 获取一条待审核校友信息
        const [rows] = await conn.execute(
            `
            SELECT
                p.id AS pending_id, 
                p.name AS pending_name, 
                p.sex AS pending_sex, 
                p.birthday AS pending_birthday, 
                p.graduation_year AS pending_graduation_year,
                p.major AS pending_major, 
                p.region AS pending_region, 
                p.company AS pending_company, 
                p.position AS pending_position, 
                p.education AS pending_education, 
                p.department AS pending_department,
                p.source, 
                s.id AS source_id, 
                s.name AS source_name, 
                s.sex AS source_sex,
                s.birthday AS source_birthday, 
                s.graduation_year AS source_graduation_year, 
                s.department AS source_department, 
                s.major AS source_major, 
                s.company_place AS source_region,
                s.company AS source_company, 
                s.job_title AS source_position
            FROM pending_alumni p
            LEFT JOIN source_alumni s ON p.source_id = s.id
            WHERE ${whereClause}
            LIMIT 1
            `,
            queryParams
        );

        if (rows.length === 0) {
            return {
                code: 200,
                message: '没有待确认数据',
                data: {
                    sourceAlumni: null,
                    pendingAlumni: null,
                    pendingCount: countRows[0].total
                }
            };
        }

        const row = rows[0];

        const pendingAlumni = {
            id: row.pending_id,
            name: row.pending_name,
            sex: row.pending_sex,
            birthday: row.pending_birthday,
            graduation_year: row.pending_graduation_year,
            major: row.pending_major,
            region: row.pending_region,
            company: row.pending_company,
            position: row.pending_position,
            education: row.pending_education,
            department: row.pending_department,
            source: row.source
        };

        let sourceAlumni = null;
        if (row.source_id) {
            sourceAlumni = {
                id: row.source_id,
                name: row.source_name,
                sex: row.source_sex,
                birthday: row.source_birthday,
                graduation_year: row.source_graduation_year,
                department: row.source_department,
                major: row.source_major,
                region: row.source_region,
                company: row.source_company,
                position: row.source_position
            };
        }

        return {
            code: 200,
            message: '获取成功',
            data: {
                sourceAlumni,
                pendingAlumni,
                pendingCount: countRows[0].total
            }
        };
    } catch (error) {
        console.error('获取待审核数据失败:', error);
        return {
            code: 500,
            message: '获取待审核数据失败',
            error: error.message
        };
    } finally {
        await closeConnection();
    }
};


// 提交审核结果
const submitReviewResult = async (event) => {
    const { alum_id, reviewerId, result, remark } = event;

    try {
        const conn = await createConnection();

        // 添加审核记录
        const [updateResult] = await conn.execute(`
            INSERT INTO review_note(alum_id, user_id, result, remark)
            VALUES (?, ?, ?, ?)
        `, [alum_id, reviewerId, result, remark]);

        if (updateResult.affectedRows === 0) {
            throw new Error('未找到待审核记录');
        }

        return { code: 200, message: '审核完成' };
    } catch (error) {
        return handleError('审核提交失败', error);
    } finally {
        await closeConnection();
    }
};

exports.main = async (event, context) => {
    switch (event.action) {
        case 'apply':
            return await applyAlumni(event);
        case 'getPendingMatches':
            return await getPendingMatches(event);
        case 'submitReviewResult':
            return await submitReviewResult(event);
        default:
            return { code: 400, message: '无效的操作' };
    }
};