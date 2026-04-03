-- ============================================================
-- Web3 成长之旅 · Supabase 数据库迁移脚本 v3
-- 为 badges 表增加区块链字段
--
-- ⚠️ 此脚本为增量迁移，不会删除现有数据
-- 使用方法：
--   Supabase 控制台 → SQL Editor → New query → 粘贴运行
-- ============================================================

-- 为 badges 表添加链上相关字段
alter table badges
  add column if not exists wallet_address    text,
  add column if not exists on_chain_token_id text,
  add column if not exists tx_hash           text,
  add column if not exists ipfs_metadata_url text;

-- 验证迁移结果
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'badges'
order by ordinal_position;
