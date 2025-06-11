// 配置文件导入
const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');
const axios = require('axios');

cloud.init();

const pool = mysql.createPool({
  host: '124.223.63.202',
  user: 'wut815',
  password: 'zdd.410@K39Y@sct.815',
  database: 'whut_alumni_miniprogram',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

exports.main = async (event) => {
	// 搜索校友
	if (event.action === 'search') {
		const {
			keyword,
			page = 1,
			pageSize = 10
		} = event

		// 确保搜索关键字有效
		if (!keyword.trim()) {
			return {
				data: [],
				hasMore: false
			}
		}
		
		try {
			// 计算分页偏移量
			const offset = (page - 1) * pageSize

			// 查询 SQL 语句（模糊搜索）
			const searchSQL = `
            SELECT *
            FROM famous_alumni
            WHERE name LIKE ? OR company LIKE ? OR position LIKE ? OR region LIKE ?
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            `

			// 查询总数（用于判断是否有更多数据）
			const countSQL = `
            SELECT COUNT(*) as total FROM famous_alumni
            WHERE name LIKE ? OR company LIKE ? OR position LIKE ? OR region LIKE ?
            `

			// 处理关键字匹配
			const searchParam = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, pageSize, offset]
			const countParam = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, ]

			// 执行查询
			const [results] = await pool.query(searchSQL, searchParam)
			const [
				[{
					total
				}]
			] = await pool.query(countSQL, countParam)

			// 计算是否有更多数据
			const hasMore = page * pageSize < total

			return {
				data: results,
				hasMore
			}
		} catch (error) {
			console.error('数据库查询失败:', error)
			return {
				data: [],
				hasMore: false,
				error: error.message
			}
		}
	}
	// 获取知名校友列表
	else if (event.action === 'getFamousAlumni') {
		// 从 event 中获取 category 参数
		const {
			category
		} = event;
		try {
			// 配置 MySQL 连接
      
			const [rows] = await pool.execute(
				'SELECT id, category, name, region, company, position, graduation_year, major, deeds FROM famous_alumni WHERE category LIKE?',
				[`%${category}%`]
			);
			
			return {
				code: 200,
				message: '查询成功',
				result: rows
			};
		} catch (error) {
			console.error('数据库错误:', error);
			return {
				code: 500,
				message: '数据库查询失败',
				error
			};
		}
	}
	// 获取知名校友详情
	else if (event.action === 'getAlumniDetail') {
		const {
			id
		} = event;

		if (!id) {
			return {
				code: 400,
				message: '缺少 id 参数',
				result: {}
			};
		}

		let connection;
		try {
      
			const [rows] = await pool.execute(
				'SELECT category, name, region, company, position, graduation_year, major, deeds FROM famous_alumni WHERE id =?',
				[id]
			);
			

			if (rows.length === 0) {
				return {
					code: 404,
					message: '未找到对应的校友信息',
					result: {}
				};
			}

			// 直接返回第一条记录
			return {
				code: 200,
				message: '查询成功',
				result: rows[0]
			};
		} catch (error) {
			console.error('数据库查询出错:', error);
			return {
				code: 500,
				message: `数据库查询失败: ${error.message}`,
				result: {}
			};
		} finally {
			if (connection) {
				
			}
		}
	}
	// 获取校友单位地址
	else if (event.action === 'getCompanyList') {
		try {
			// 创建数据库连接
      
			// 获取公司名称和经纬度列表
			const [rows] = await pool.execute(`SELECT company, lat,lng,COUNT(*) AS total 
                FROM famous_alumni
                WHERE region LIKE ?
                GROUP BY company,lat,lng`, [event.region]);
			if (rows.length) {
				const resultWithIndex = rows.map((row, index) => ({
					...row,
					id: index + 1 // 从 1 开始的序号
				}));
				return {
					success: 200,
					message: '获取公司列表成功',
					result: resultWithIndex
				};
			} else {
				return {
					code: 404,
					message: '没有找到公司数据'
				};
			}

		} catch (error) {
			console.error('数据库查询错误:', error);
			return {
				code: 500,
				message: '服务器错误，请稍后重试'
			};
		}
  } 
  // 根据单位查询校友列表
  else if (event.action === 'getAlumniByCompany') {
		const company = event.company;
		try {
			const [rows] = await pool.execute(
				'SELECT * FROM famous_alumni WHERE company = ?',
				[company]
			);
			if (rows.length) {
				return {
					success: 200,
					message: '获取校友数据成功',
					result: rows
				};
			} else {
				return {
					code: 404,
					message: `未找到${company}的校友信息`
				};

			}
		} catch (error) {
			console.error('数据库查询错误:', error);
			return {
				code: 500,
				message: '服务器错误，请稍后重试'
			};
		}
	}
	//获取学院列表
	else if (event.action === 'listDept') {
		try {
			const [rows] = await pool.execute(
				'SELECT dept_name FROM department'
			);
			
			return {
				code: 200,
				message: '查询成功',
				result: rows
			};
		} catch (error) {
			console.error('数据库错误:', error);
			return {
				code: 500,
				message: '数据库查询失败',
				error
			};
		}
	}
	// 获取活动列表
	else if (event.action === 'getActivity') {
		try {
			// 创建数据库连接
      

			// 执行 SQL 查询，使用反引号包裹保留关键字
			const [rows] = await pool.execute(
				'SELECT id, title, `describe`, date, image FROM activity'
			);

			// 关闭数据库连接
			

			// 返回成功结果
			return {
				code: 200,
				message: '查询成功',
				result: rows
			};
		} catch (error) {
			// 捕获并打印错误信息
			console.error('数据库查询错误:', error);
			// 返回错误结果
			return {
				code: 500,
				message: '服务器错误，请稍后重试'
			};
		}
	}
	// 获取新闻列表
	else if (event.action === 'getNews') {
		try {
      
			const [rows] = await pool.execute(
				'SELECT id, title, `describe`, date, image FROM news'
			);
			

			return {
				code: 200,
				message: '查询成功',
				result: rows
			};
		} catch (error) {
			console.error('数据库查询错误:', error);
			return {
				code: 500,
				message: '服务器错误，请稍后重试'
			};
		}
	}
	// 生成邀请码
  else if (event.action === 'genInviteCode') {
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const userId = event.userId;
      if (!userId) {
          return {
              code: 400,
              message: '缺少 userId'
          };
      }

      
      try {
          await pool.execute(
              'INSERT INTO invitation (user_id, invite_code) VALUES (?, ?)',
              [userId, code]
          );

          return {
              code: 200,
              message: '生成成功',
              result: code,
          };
      } catch (err) {
          console.error(err);
          return {
              code: 500,
              message: '服务器内部错误'
          };
      } finally {
          
      }
  }
  // 查询邀请码列表
  else if (event.action === 'selectInviteCode') {
      const userId = event.userId;
      if (!userId) {
          return {
              code: 400,
              message: '缺少 userId'
          };
      }

      
      try {
          const [rows] = await pool.execute(
              'SELECT invite_code FROM invitation WHERE user_id = ?',
              [userId]
          );

          const inviteCodes = rows.map(row => row.invite_code);

          return {
              code: 200,
              message: '查询成功',
              result: inviteCodes,
          };
      } catch (err) {
          console.error(err);
          return {
              code: 500,
              message: '服务器内部错误'
          };
      } finally {
          
      }
  }
  // 生成邀请二维码
  else if (event.action === 'genQRcode') {
      const inviteCode = event.code
      const fileName = `inviteCodes/${inviteCode}.png`;
      try {
        const tempRes = await cloud.getTempFileURL({
          fileList: [fileName]
        });
        const fileInfo = tempRes.fileList[0];
        if (fileInfo && fileInfo.status === 0 && fileInfo.tempFileURL) {
          return {
            success: true,
            fileID: fileName,
            tempFileURL: fileInfo.tempFileURL,
            cached: true
          };
        }
      } catch (e) {
        console.log('文件不存在或获取失败，准备重新生成');
      }
      
      const qrCodeUrl = `https://open-api.cli.im/cli-open-platform-service/v1/labelStyle/createWithKey?api_key=CL8c1fb2dd1d1dc9f7&cliT=D4&cliD=https://alumni.kmoon.fun/invite/index.html?inviteCode=${inviteCode}`;
      try {
        const response = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        // 上传文件
          const uploadRes = await cloud.uploadFile({
          cloudPath: fileName,
          fileContent: buffer
          })
          const fileID = uploadRes.fileID
          return {
          success: true,
          fileID
          }
      } catch (e) {
          return {
          success: false,
          error: e.message
          }
      }
  }
  // 删除邀请码
  else if (event.action === 'delInviteCode') {
      const code = event.code
      
      try {
          await pool.execute(
              'delete from invitation WHERE invite_code = ?',
              [code]
          );
          return {
              code: 200,
              success: true,
              message: '删除成功',
          };
      } catch (err) {
          console.error(err);
          return {
              code: 500,
              message: '服务器内部错误'
          };
      } finally {
          
      }
  }
}