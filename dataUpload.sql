-- create database pf;

drop table if exists public.tblActuals;

create table public.tblActuals (
    "origYr" int,
    "origMnth" varchar(3),
    "origStateCd" varchar(2),
    "productCd" varchar(10),
    "customerChannel" varchar(20),
    "customerType" varchar(20),
    "cn" int
);

COPY public.tblActuals
FROM '/tmp/tblActuals.csv' 
WITH (
        FORMAT CSV, 
        HEADER TRUE, 
        NULL '', 
        FORCE_NULL ("origYr", "origMnth", "origStateCd", "productCd", "customerChannel", "customerType", "cn"));

select * from public.tblActuals;

select  TO_DATE("origYr" || '-' || "origMnth", 'YYYY-Mon') as eomOrigDate,
        "origStateCd",
        "productCd",
        "customerChannel",
        "customerType",
        "cn" as cn
from    public.tblActuals;  