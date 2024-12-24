<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="上报日期" prop="publishDate">
        <el-date-picker clearable
                        v-model="queryParams.publishDate"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="请选择上报日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="分包企业名称" prop="companyName">
        <el-input
          v-model="queryParams.companyName"
          placeholder="请输入分包企业名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="统一信用代码" prop="uniHonestCode">
        <el-input
          v-model="queryParams.uniHonestCode"
          placeholder="请输入统一信用代码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="法定代表人" prop="lawmanName">
        <el-input
          v-model="queryParams.lawmanName"
          placeholder="请输入法定代表人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="委托代理人" prop="agentName">
        <el-input
          v-model="queryParams.agentName"
          placeholder="请输入委托代理人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="委托代理人身份证号" prop="agentId">
        <el-input
          v-model="queryParams.agentId"
          placeholder="请输入委托代理人身份证号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="备注" prop="Notes">
        <el-input
          v-model="queryParams.Notes"
          placeholder="请输入备注"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:bancompany:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:bancompany:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:bancompany:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:bancompany:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bancompanyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="上报日期" align="center" prop="publishDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.publishDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分包企业名称" align="center" prop="companyName" />
      <el-table-column label="统一信用代码" align="center" prop="uniHonestCode" />
      <el-table-column label="法定代表人" align="center" prop="lawmanName" />
      <el-table-column label="委托代理人" align="center" prop="agentName" />
      <el-table-column label="委托代理人身份证号" align="center" prop="agentId" />
      <el-table-column label="不合格原因" align="center" prop="failReason" />
      <el-table-column label="备注" align="center" prop="Notes" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:bancompany:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:bancompany:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改中国中铁不合格分包企业名录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上报日期" prop="publishDate">
          <el-date-picker clearable
                          v-model="form.publishDate"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择上报日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="分包企业名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入分包企业名称" />
        </el-form-item>
        <el-form-item label="统一信用代码" prop="uniHonestCode">
          <el-input v-model="form.uniHonestCode" placeholder="请输入统一信用代码" />
        </el-form-item>
        <el-form-item label="法定代表人" prop="lawmanName">
          <el-input v-model="form.lawmanName" placeholder="请输入法定代表人" />
        </el-form-item>
        <el-form-item label="委托代理人" prop="agentName">
          <el-input v-model="form.agentName" placeholder="请输入委托代理人" />
        </el-form-item>
        <el-form-item label="委托代理人身份证号" prop="agentId">
          <el-input v-model="form.agentId" placeholder="请输入委托代理人身份证号" />
        </el-form-item>
        <el-form-item label="不合格原因" prop="failReason">
          <el-input v-model="form.failReason" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="Notes">
          <el-input v-model="form.Notes" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listBancompany, getBancompany, delBancompany, addBancompany, updateBancompany } from "@/api/system/bancompany";

export default {
  name: "Bancompany",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 中国中铁不合格分包企业名录表格数据
      bancompanyList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        publishDate: null,
        companyName: null,
        uniHonestCode: null,
        lawmanName: null,
        agentName: null,
        agentId: null,
        failReason: null,
        Notes: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询中国中铁不合格分包企业名录列表 */
    getList() {
      this.loading = true;
      listBancompany(this.queryParams).then(response => {
        this.bancompanyList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        Id: null,
        publishDate: null,
        companyName: null,
        uniHonestCode: null,
        lawmanName: null,
        agentName: null,
        agentId: null,
        failReason: null,
        Notes: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id || item.id);
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加中国中铁不合格分包企业名录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const Id = row.id || this.ids
      getBancompany(Id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改中国中铁不合格分包企业名录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateBancompany(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBancompany(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const Ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除中国中铁不合格分包企业名录编号为"' + Ids + '"的数据项？').then(function() {
        return delBancompany(Ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/bancompany/export', {
        ...this.queryParams
      }, `bancompany_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
