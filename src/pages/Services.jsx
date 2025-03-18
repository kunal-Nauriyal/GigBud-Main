import styles from "./Services.module.css";
import Tasks from "../pages/PopularTasks";


export default function Services() {
  return (
    <div className={styles.services}>
      <h1>Our Services</h1>
      <div className={styles.serviceGrid}>
        <div className={styles.serviceCard}>
          <h2>Task Posting</h2>
          <p>Post tasks and find the right person to get the job done.</p>
        </div>
        <div className={styles.serviceCard}>
          <h2>Task Completion</h2>
          <p>Complete tasks and earn money in your free time.</p>
        </div>
        <div className={styles.serviceCard}>
          <h2>Secure Payments</h2>
          <p>All payments are handled securely through our platform.</p>
        </div>
      </div>
      <Tasks />
     
    </div>
  );
}