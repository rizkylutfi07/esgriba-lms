import React from "react";

interface ExamCardProps {
  name: string;
  className: string;
  urlLogin: string;
  username: string;
  password: string;
  examName: string;
  year: string;
  printDate: string;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  name,
  className,
  urlLogin,
  username,
  password,
  examName,
  year,
  printDate,
}) => {
  return (
    <div className="exam-card-new">
      {/* Header dengan Logo, Judul, dan Panitia */}
      <div className="card-header-new">
        <div className="header-logo">
          <img
            src="/logo-sekolah.png"
            alt="Logo Sekolah"
            className="logo-img"
            onError={(e) => {
              console.error("Logo tidak ditemukan");
            }}
          />
        </div>
        <div className="header-title">
          <div className="title-line">SMKS PGRI BANYUPUTIH</div>
          <div className="title-line">{examName}</div>
          <div className="title-line">TAHUN PELAJARAN {year}</div>
        </div>
        <div className="header-panitia">
          <div className="panitia-box">Panitia</div>
        </div>
      </div>

      {/* Body dengan Data Siswa */}
      <div className="header-body">KARTU PESERTA</div>
      <div className="card-body-new">
        <table className="data-table">
          <tbody>
            <tr>
              <td className="label-col">Nama</td>
              <td className="colon-col">:</td>
              <td className="value-col">{name}</td>
            </tr>
            <tr>
              <td className="label-col">Kelas</td>
              <td className="colon-col">:</td>
              <td className="value-col">{className}</td>
            </tr>
            <tr>
              <td className="label-col">Url Login</td>
              <td className="colon-col">:</td>
              <td className="value-col">{urlLogin}</td>
            </tr>
            <tr>
              <td className="label-col">Username</td>
              <td className="colon-col">:</td>
              <td className="value-col">{username}</td>
            </tr>
            <tr>
              <td className="label-col">Password</td>
              <td className="colon-col">:</td>
              <td className="value-col">123456</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer dengan NB dan TTD */}
      <div className="card-footer-new">
        <div className="footer-note">
          <div style={{ fontWeight: "bold" }}>
            NB : KARTU UJIAN
            <br />
            WAJIB DIBAWA
            <br />
            SELAMA UJIAN
            <br />
            BERLANGSUNG...!!!
          </div>
        </div>
        <div className="footer-signature">
          <div className="sig-date">Banyuputih, {printDate}</div>
          <div className="sig-title">Kepala Sekolah,</div>
          <div className="sig-space"></div>
          <div className="sig-name">Irawan Adi Wasito, S.T</div>
        </div>
      </div>
    </div>
  );
};

export default ExamCard;
